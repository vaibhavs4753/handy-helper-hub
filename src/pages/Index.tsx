import { useNavigate } from 'react-router-dom';
import { Zap, Wrench, Droplets, Shield, Clock, Star, MapPin, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted by 10,000+ customers</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Expert Repairs,
              <span className="block text-gradient">At Your Doorstep</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Connect with skilled technicians for electrical, mechanical, and plumbing services. 
              Get instant quotes and real-time tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="gradient-accent text-accent-foreground shadow-accent-glow text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Book a Service
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate('/auth')}
              >
                Join as Technician
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span>Verified Technicians</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>24/7 Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <span>Live Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional home repair services at your fingertips
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Electrical */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-electrical/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-electrical/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-electrical" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Electrical</h3>
              <p className="text-muted-foreground mb-4">
                Wiring repairs, outlet installation, circuit breaker fixes, lighting solutions, and more.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Wiring & Rewiring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Switch & Outlet Repair
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Lighting Installation
                </li>
              </ul>
            </div>

            {/* Mechanical */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-mechanical/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-mechanical/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-8 h-8 text-mechanical" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Mechanical</h3>
              <p className="text-muted-foreground mb-4">
                HVAC repairs, appliance fixes, equipment maintenance, and general mechanical work.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  AC & Heating Repair
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Appliance Service
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Equipment Maintenance
                </li>
              </ul>
            </div>

            {/* Plumbing */}
            <div className="group p-8 rounded-2xl bg-card border border-border hover:border-plumbing/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-plumbing/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-8 h-8 text-plumbing" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Plumbing</h3>
              <p className="text-muted-foreground mb-4">
                Pipe repairs, fixture installation, drain cleaning, water heater service, and more.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Leak Repair
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Drain Cleaning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Fixture Installation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your repairs done in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Select Service', description: 'Choose the type of repair you need', icon: '🎯' },
              { step: '02', title: 'Find Technician', description: 'View nearby available technicians', icon: '📍' },
              { step: '03', title: 'Secure Payment', description: 'Pay securely before service starts', icon: '💳' },
              { step: '04', title: 'Track & Complete', description: 'Real-time tracking until completion', icon: '✅' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-sm font-medium text-primary mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center gradient-primary rounded-3xl p-12 shadow-glow">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of satisfied customers and get your repairs done today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
                onClick={() => navigate('/auth')}
              >
                Get Started Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8"
                onClick={() => navigate('/auth')}
              >
                Become a Technician
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Wrench className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">FixIt<span className="text-primary">Pro</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FixIt Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
