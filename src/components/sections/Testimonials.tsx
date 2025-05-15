import Image from "next/image";

const testimonials = [
  {
    id: 1,
    quote: "This platform has transformed how we manage our real estate listings. The AI-generated content saves us hours of work.",
    author: "Sarah Johnson",
    position: "Marketing Director, Luxury Homes",
    avatar: "/avatars/avatar-1.jpg"
  },
  {
    id: 2,
    quote: "The brochures we create with this tool have consistently impressed our clients and helped us close deals faster.",
    author: "Michael Chen",
    position: "Real Estate Broker, Pacific Properties",
    avatar: "/avatars/avatar-2.jpg"
  },
  {
    id: 3,
    quote: "I was skeptical about AI-generated content, but the quality is outstanding. Our conversion rates have improved by 40%.",
    author: "Alicia Reynolds",
    position: "CEO, Urban Living Realty",
    avatar: "/avatars/avatar-3.jpg"
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 px-4 relative z-10">
      {/* Animated background elements */}
      <div 
        data-aos="fade-in" 
        data-aos-duration="1500" 
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trusted by Industry Leaders</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hear from our customers who have transformed their real estate marketing with our platform.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="bg-[#0c1324] border border-[#1c2a47] rounded-xl p-8 shadow-lg hover:bg-[#111b33] transition-all hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="flex items-center mb-6">
                <svg className="text-blue-400 w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-700 flex items-center justify-center border border-white/20">
                  {testimonial.avatar ? (
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {testimonial.author.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-white font-medium">{testimonial.author}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 