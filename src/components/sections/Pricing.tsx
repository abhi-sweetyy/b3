import { useState } from 'react';

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual agents",
      monthlyPrice: 19,
      yearlyPrice: 190,
      features: [
        "5 AI-generated documents per month",
        "10 template options",
        "Basic image editing",
        "Email support",
        "PDF export"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      description: "For growing real estate teams",
      monthlyPrice: 49,
      yearlyPrice: 490,
      features: [
        "25 AI-generated documents per month",
        "All templates included",
        "Advanced image editing",
        "Priority support",
        "PDF & DOCX exports",
        "Team collaboration (3 users)"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Agency",
      description: "For established brokerages",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: [
        "Unlimited AI-generated documents",
        "Custom templates option",
        "Advanced image editing & enhancement",
        "Dedicated account manager",
        "All export formats",
        "Team collaboration (10 users)",
        "White labeling"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 relative z-10">
      {/* Animated background elements */}
      <div 
        data-aos="fade-in" 
        data-aos-duration="1500" 
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Choose the plan that's right for your real estate business.
          </p>
          
          {/* Toggle switch */}
          <div className="flex items-center justify-center">
            <span className={`mr-3 ${annual ? 'text-gray-400' : 'text-white font-medium'}`}>Monthly</span>
            <div 
              className="relative w-14 h-7 bg-blue-600 rounded-full cursor-pointer"
              onClick={() => setAnnual(!annual)}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${annual ? 'left-8' : 'left-1'}`}></div>
            </div>
            <span className={`ml-3 ${annual ? 'text-white font-medium' : 'text-gray-400'}`}>
              Annual <span className="text-green-500 text-sm">Save 20%</span>
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`p-8 ${plan.popular ? 'bg-[#111b33]' : 'bg-[#0c1324]'} border ${plan.popular ? 'border-blue-500/50' : 'border-[#1c2a47]'} rounded-xl relative ${plan.popular ? 'shadow-lg shadow-blue-500/10' : ''} transition-all duration-300 hover:bg-[#14213d] hover:-translate-y-1`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-b-md">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-300 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${annual ? plan.yearlyPrice : plan.monthlyPrice}</span>
                <span className="text-gray-400">/{annual ? 'year' : 'month'}</span>
              </div>
              
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-medium ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                    : 'bg-[#1c2a47] hover:bg-[#263656] text-white'
                } transition-colors`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12 text-gray-400">
          All plans include a 14-day free trial. No credit card required.
        </div>
      </div>
    </section>
  );
} 