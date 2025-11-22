import { TrendingUp, Shield, Zap, Users, BarChart, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../config/language.config';

const t = TRANSLATIONS.en;

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onShowSignUp: () => void;
}

export function LandingPage({ onShowSignUp }: LandingPageProps) {
  const features = [
    {
      icon: <Zap className="w-12 h-12" />,
      title: t.landing.features.items[0].title,
      description: t.landing.features.items[0].description,
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: t.landing.features.items[1].title,
      description: t.landing.features.items[1].description,
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: t.landing.features.items[2].title,
      description: t.landing.features.items[2].description,
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: t.landing.features.items[3].title,
      description: t.landing.features.items[3].description,
    },
    {
      icon: <BarChart className="w-12 h-12" />,
      title: t.landing.features.items[4].title,
      description: t.landing.features.items[4].description,
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: t.landing.features.items[5].title,
      description: t.landing.features.items[5].description,
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="hero min-h-[80vh] bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t.landing.hero.title}
            </h1>
            <p className="text-2xl md:text-3xl mb-4 font-semibold text-base-content/90">
              {t.landing.hero.subtitle}
            </p>
            <p className="text-lg md:text-xl mb-8 text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              {t.landing.hero.description}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={onShowSignUp} className="btn btn-primary btn-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                {t.landing.hero.cta}
              </button>
              <button className="btn btn-outline btn-lg hover:btn-secondary hover:scale-105 transition-all duration-300">
                {t.landing.hero.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.landing.features.title}
            </h2>
            <p className="text-xl text-base-content/70">
              {t.landing.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="card-body items-center text-center">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="card-title text-2xl mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.landing.useCases.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.landing.useCases.items.map((useCase, index) => (
              <div key={index} className="card bg-base-200 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title text-xl">{useCase.title}</h3>
                  <p className="text-base-content/70">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-primary to-secondary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.landing.cta.title}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t.landing.cta.description}
          </p>
          <button onClick={onShowSignUp} className="btn btn-lg bg-base-100 text-primary hover:bg-base-200 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 border-2 border-base-100">
            {t.landing.cta.button}
          </button>
        </div>
      </section>

      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <div>
          <p className="font-bold text-lg">{t.common.appName}</p>
          <p>Copyright © 2024 - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}