import Image from "next/image";

const caseStudies = [
  {
    id: 1,
    title: "Luxury Apartment Complex",
    description: "How a developer increased property viewings by 85% using our AI-generated brochures",
    image: "/case-studies/luxury-apartment.jpg",
    results: "85% increase in viewings"
  },
  {
    id: 2,
    title: "Residential Community",
    description: "Creating compelling narratives that sold out a new development in record time",
    image: "/case-studies/residential-community.jpg",
    results: "Sold out in 3 months"
  },
  {
    id: 3,
    title: "Commercial Office Space",
    description: "Transforming technical specifications into engaging property descriptions",
    image: "/case-studies/commercial-office.jpg",
    results: "45% faster leasing"
  }
];

export default function CaseStudies() {
  return (
    <section className="py-16 md:py-24 px-4 relative z-10">
      {/* Animated background elements */}
      <div 
        data-aos="fade-in" 
        data-aos-duration="1500" 
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Success Stories</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See how real estate professionals are using our platform to revolutionize their marketing.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div 
              key={index} 
              className="bg-[#0c1324] border border-[#1c2a47] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-900/10 hover:shadow-xl"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Study image */}
              <div className="relative h-48 w-full">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs font-bold px-3 py-1">
                  {study.results}
                </div>
              </div>
              
              {/* Study content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                <p className="text-gray-300 mb-4">{study.description}</p>
                <a href="#" className="text-blue-400 hover:text-blue-300 inline-flex items-center">
                  Read case study
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 