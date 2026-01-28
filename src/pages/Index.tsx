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
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              <span>Trusted by 10,000+ customers</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 animate-slide-up leading-tight">
              Expert Repairs,
              <span className="block text-gradient">At Your Doorstep</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 animate-slide-up px-2 sm:px-0" style={{ animationDelay: '0.1s' }}>
              Connect with skilled technicians for electrical, mechanical, and plumbing services. 
              Get instant quotes and real-time tracking.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up px-4 sm:px-0" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="gradient-accent text-accent-foreground shadow-accent-glow text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                Book a Service
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                Join as Technician
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                <span>Verified Technicians</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span>24/7 Availability</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span>Live Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Our Services</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Professional home repair services at your fingertips
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Electrical */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-electrical/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-electrical/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-electrical" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Electrical</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Wiring repairs, outlet installation, circuit breaker fixes, lighting solutions, and more.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Wiring & Rewiring
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Switch & Outlet Repair
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Lighting Installation
                </li>
              </ul>
            </div>

            {/* Mechanical */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-mechanical/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-mechanical/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-mechanical" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Mechanical</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                HVAC repairs, appliance fixes, equipment maintenance, and general mechanical work.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  AC & Heating Repair
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Appliance Service
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Equipment Maintenance
                </li>
              </ul>
            </div>

            {/* Plumbing */}
            <div className="group p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-plumbing/50 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-plumbing/10 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-plumbing" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">Plumbing</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Pipe repairs, fixture installation, drain cleaning, water heater service, and more.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Leak Repair
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Drain Cleaning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  Fixture Installation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Get your repairs done in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Select Service', description: 'Choose the type of repair you need', icon: '🎯' },
              { step: '02', title: 'Find Technician', description: 'View nearby available technicians', icon: '📍' },
              { step: '03', title: 'Secure Payment', description: 'Pay securely before service starts', icon: '💳' },
              { step: '04', title: 'Track & Complete', description: 'Real-time tracking until completion', icon: '✅' },
            ].map((item, index) => (
              <div key={index} className="text-center p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">{item.icon}</div>
                <div className="text-xs sm:text-sm font-medium text-primary mb-1 sm:mb-2">{item.step}</div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center gradient-primary rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-glow">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-3 sm:mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg text-primary-foreground/80 mb-6 sm:mb-8 px-2">
              Join thousands of satisfied customers and get your repairs done today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                Get Started Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
                onClick={() => navigate('/auth')}
              >
                Become a Technician
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border bg-background safe-bottom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <span className="text-base sm:text-lg font-bold text-foreground">FixIt<span className="text-primary">Pro</span></span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 FixIt Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
