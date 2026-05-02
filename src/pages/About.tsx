import React from 'react';
import { motion } from 'motion/react';
import { Info } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-bg border border-border-subtle rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-text-main">About Us</h1>
          </div>
          
          <div className="prose prose-slate max-w-none text-text-muted">
            <p className="text-lg leading-relaxed">
              Welcome to our platform. We provide high-quality digital products and services 
              tailored to your needs. Our mission is to deliver excellence through innovation 
              and customer-centric solutions.
            </p>
            <h2 className="text-xl font-semibold text-text-main mt-8 mb-4">Our Values</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
              <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <strong className="text-text-main block mb-1">Quality First</strong>
                We ensure every product meets the highest standards.
              </li>
              <li className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <strong className="text-text-main block mb-1">Reliability</strong>
                Count on us for consistent service and support.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
