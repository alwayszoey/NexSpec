import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, Zap, Star, ShieldCheck } from 'lucide-react';
import { resourcesData } from '../data';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const product = resourcesData.find(item => item.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-text-main mb-4">Product Not Found</h1>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-brand font-medium hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Go back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-brand transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-3xl overflow-hidden border border-border-subtle bg-card-bg shadow-sm"
          >
            <img 
              src={product.imageUrl} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Right: Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-main mb-4 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">4.9</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="text-sm text-text-muted">1.2k Sold</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
              <div className="text-sm text-text-muted mb-1">Price</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand">{product.price}</span>
                <span className="text-sm font-medium text-text-muted uppercase">THB</span>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-sm font-bold text-text-main mb-2 uppercase tracking-wide">Description</h3>
                <p className="text-text-muted leading-relaxed">
                  {product.shortDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <Zap className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-text-main">Instant Delivery</div>
                    <div className="text-[10px] text-text-muted">Receive your order instantly after payment.</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-text-main">Buyer Protection</div>
                    <div className="text-[10px] text-text-muted">Your purchase is secured and verified.</div>
                  </div>
                </div>
              </div>
            </div>

            <button className="flex items-center justify-center gap-3 w-full bg-brand text-white font-bold py-5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand/20 text-lg">
              <ShoppingCart className="w-6 h-6" />
              Buy Now
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
