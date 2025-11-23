import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ImportRequest {
  importId: string;
  dataSourceId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { importId, dataSourceId }: ImportRequest = await req.json();

    // Update import status to processing
    await supabase
      .from('data_source_imports')
      .update({ status: 'processing' })
      .eq('id', importId);

    // Get data source configuration
    const { data: dataSource, error: dsError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .single();

    if (dsError || !dataSource) {
      throw new Error('Data source not found');
    }

    let topicsImported = 0;
    let topicsUpdated = 0;
    let topicsSkipped = 0;

    // Process based on source type
    switch (dataSource.source_type) {
      case 'api': {
        const result = await importFromAPI(supabase, dataSource);
        topicsImported = result.imported;
        topicsUpdated = result.updated;
        topicsSkipped = result.skipped;
        break;
      }
      case 'rss': {
        const result = await importFromRSS(supabase, dataSource);
        topicsImported = result.imported;
        topicsUpdated = result.updated;
        topicsSkipped = result.skipped;
        break;
      }
      case 'json': {
        const result = await importFromJSON(supabase, dataSource);
        topicsImported = result.imported;
        topicsUpdated = result.updated;
        topicsSkipped = result.skipped;
        break;
      }
      case 'scraper': {
        const result = await importFromScraper(supabase, dataSource);
        topicsImported = result.imported;
        topicsUpdated = result.updated;
        topicsSkipped = result.skipped;
        break;
      }
      default:
        throw new Error(`Unsupported source type: ${dataSource.source_type}`);
    }

    // Update import record
    await supabase
      .from('data_source_imports')
      .update({
        status: 'completed',
        topics_imported: topicsImported,
        topics_updated: topicsUpdated,
        topics_skipped: topicsSkipped,
        completed_at: new Date().toISOString(),
      })
      .eq('id', importId);

    // Update data source last sync
    await supabase
      .from('data_sources')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', dataSourceId);

    return new Response(
      JSON.stringify({
        success: true,
        imported: topicsImported,
        updated: topicsUpdated,
        skipped: topicsSkipped,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const { importId } = await req.json().catch(() => ({ importId: null }));
    
    if (importId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from('data_source_imports')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function importFromAPI(supabase: any, dataSource: any) {
  const { source_url, config } = dataSource;
  const response = await fetch(source_url);
  const data = await response.json();

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  // Process items based on config mapping
  const items = config.dataPath ? getNestedProperty(data, config.dataPath) : data;
  
  for (const item of items) {
    const topicData = {
      title: getNestedProperty(item, config.titleField || 'title'),
      description: getNestedProperty(item, config.descriptionField || 'description'),
      created_by: dataSource.created_by,
      is_public: true,
      metadata: { source: dataSource.name, sourceId: item.id },
    };

    // Check if topic already exists
    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .eq('metadata->>sourceId', item.id)
      .eq('metadata->>source', dataSource.name)
      .maybeSingle();

    if (existing) {
      skipped++;
    } else {
      const { error } = await supabase.from('topics').insert(topicData);
      if (!error) imported++;
    }
  }

  return { imported, updated, skipped };
}

async function importFromRSS(supabase: any, dataSource: any) {
  const { source_url } = dataSource;
  const response = await fetch(source_url);
  const xml = await response.text();
  
  // Simple RSS parser
  const items = xml.match(/<item[\s\S]*?<\/item>/g) || [];
  
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const itemXml of items) {
    const title = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    const description = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';

    const topicData = {
      title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      description: description.replace(/<!\[CDATA\[|\]\]>/g, '').trim().substring(0, 500),
      created_by: dataSource.created_by,
      is_public: true,
      metadata: { source: dataSource.name, sourceUrl: link },
    };

    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .eq('metadata->>sourceUrl', link)
      .eq('metadata->>source', dataSource.name)
      .maybeSingle();

    if (existing) {
      skipped++;
    } else {
      const { error } = await supabase.from('topics').insert(topicData);
      if (!error) imported++;
    }
  }

  return { imported, updated, skipped };
}

async function importFromJSON(supabase: any, dataSource: any) {
  const { source_url, config } = dataSource;
  const response = await fetch(source_url);
  const data = await response.json();

  return await importFromAPI(supabase, { ...dataSource, source_url });
}

async function importFromScraper(supabase: any, dataSource: any) {
  // For scraping, we'd need a more sophisticated approach
  // This is a placeholder that could integrate with a Python scraper
  throw new Error('Scraper import type requires Python integration');
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}
