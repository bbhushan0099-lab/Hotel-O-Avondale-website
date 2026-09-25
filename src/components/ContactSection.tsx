import React, { useState } from 'react';
import { saveInquiryToSupabase } from '../services/supabase';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Navigation,
  ExternalLink
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Save to Supabase
    saveInquiryToSupabase({
      name,
      phone,
      message,
    }).catch((err) => {
      console.warn('[Supabase Inquiry]', err);
    });

    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  const handleWhatsAppContact = () => {
    const text = `Hello Hotel O Avondale Front Desk! I have an inquiry about accommodation and airport transit services.`;
    const url = `https://wa.me/918209940455?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCallHotel = () => {
    window.location.href = 'tel:01244330567';
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1e2430]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37] mb-2">
          Location & Concierge
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          Connect With Our Front Desk
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#a2a9ba]">
          Whether you need flight arrival pickups, corporate group rates for JECC events, or late night check-in assistance, our team is on standby 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
        {/* Contact Info & Directions Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 bg-[#121620] border border-[#242a38] rounded-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              Property Location & Address
            </h3>

            <div className="space-y-4 text-xs text-[#b0b7c7]">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#191f2b] rounded-lg text-[#d4af37] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Hotel O Avondale (Jaipur)</div>
                  <div className="mt-0.5 leading-relaxed">
                    Plot 42-B, Sitapura Industrial Area, Near JECC & Chokhi Dhani, Tonk Road, Jaipur, Rajasthan 302022
                  </div>
                  <div className="text-[11px] text-[#d4af37] mt-1 font-medium">
                    10 mins (6.5 km) from Jaipur International Airport (JAI)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#191f2b] rounded-lg text-[#d4af37] shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Front Desk Hotlines</div>
                  <div className="mt-0.5">
                    Direct Line:{' '}
                    <a href="tel:01244330567" className="text-white hover:text-[#d4af37] transition-colors underline-offset-2">
                      01244330567
                    </a>
                  </div>
                  <div className="mt-0.5">
                    Mobile / Desk:{' '}
                    <a href="tel:8209940455" className="text-white hover:text-[#d4af37] transition-colors underline-offset-2">
                      8209940455
                    </a>{' '}
                    <span className="text-[#d4af37] text-[11px]">(WhatsApp)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#191f2b] rounded-lg text-[#d4af37] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Official Email</div>
                  <div className="mt-0.5">reservations@hotelavondalejaipur.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#191f2b] rounded-lg text-[#d4af37] shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Operating Hours</div>
                  <div className="mt-0.5">24 Hours Front Desk · 24/7 Security & Airport Cab Coordination</div>
                </div>
              </div>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="mt-6 pt-6 border-t border-[#232936] flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCallHotel}
                className="flex-1 py-3 px-4 bg-[#191f2b] hover:bg-[#222a3a] text-white border border-[#2c3444] rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#d4af37]" />
                <span>Call Front Desk</span>
              </button>

              <button
                onClick={handleWhatsAppContact}
                className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#25D366]/20 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Airport Driving Note Card */}
          <div className="p-5 bg-[#141822] border border-[#242a38] rounded-xl text-xs text-[#a2a9ba]">
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Navigation className="w-4 h-4 text-[#d4af37]" />
              <span>Airport Transit Directions</span>
            </div>
            <p className="leading-relaxed">
              Exit Jaipur Airport onto Tonk Road towards Sitapura. Proceed straight for 5 km past the Sitapura Flyover. Hotel O Avondale is located on the main corridor right before the JECC entrance lane. Cabs and pre-paid airport taxis take approximately 10 to 12 minutes.
            </p>
          </div>
        </div>

        {/* Quick Message Form */}
        <div className="lg:col-span-6">
          <div className="p-6 sm:p-8 bg-[#121620] border border-[#242a38] rounded-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-2">
              Send an Instant Inquiry
            </h3>
            <p className="text-xs text-[#9aa1b2] mb-6">
              Inquiring for bulk corporate rates, wedding room blocks, or airport shuttle transfers? Leave a message and our reservations manager will respond within 15 minutes.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-serif text-lg font-bold text-white">Inquiry Received</div>
                <p className="text-xs text-emerald-300">
                  Thank you! Our front office team has logged your request and will contact you via WhatsApp/Phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#adb4c5] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gaurav Meena"
                    className="w-full px-3.5 py-2.5 bg-[#161a24] border border-[#272e3e] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#adb4c5] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 82099 XXXXX"
                    className="w-full px-3.5 py-2.5 bg-[#161a24] border border-[#272e3e] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#adb4c5] mb-1">
                    Message / Dates / Travel Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details such as intended dates, number of guests, or airport shuttle needs..."
                    className="w-full px-3.5 py-2.5 bg-[#161a24] border border-[#272e3e] rounded-lg text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#d4af37] hover:bg-[#e2c153] text-[#0c0e12] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
