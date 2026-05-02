import React from 'react';
import { motion } from 'motion/react';
import { Mail, MessageCircle, Globe, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg border border-border-subtle rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-text-main">Contact Us</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-text-muted">
                Have questions or need support? Reach out to us through any of these 
                channels. We usually respond within 24 hours.
              </p>
              
              <div className="space-y-4">
                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand/30 hover:bg-brand/5 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-main">Discord Support</div>
                    <div className="text-xs text-text-muted">Join our community</div>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-brand/30 hover:bg-brand/5 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-brand group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-main">Telegram</div>
                    <div className="text-xs text-text-muted">@official_support</div>
                  </div>
                </a>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5 ml-1">Your Email</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5 ml-1">Message</label>
                <textarea 
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-brand text-white font-bold py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand/20">
                Send Message
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
