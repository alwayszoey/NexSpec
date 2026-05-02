import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingCart, Star, Flame, Sparkles, LayoutGrid, 
  ChevronRight, Users, Layers, Eye, Download 
} from 'lucide-react';
import { resourcesData, categoriesData } from '../data';
import { siteConfig } from '../config';

const StatsCard = ({ icon: Icon, title, value, unit }: { icon: any, title: string, value: string | number, unit: string }) => (
  <div className="relative overflow-hidden rounded-2xl flex items-center gap-3 px-4 py-4 bg-card-bg border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 text-brand">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-xs font-medium text-text-muted mb-0.5">{title}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-text-main">{value}</span>
        <span className="text-[10px] font-medium text-text-muted/70">{unit}</span>
      </div>
    </div>
  </div>
);

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-24 pb-12">
      {/* Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full rounded-3xl overflow-hidden border border-border-subtle shadow-xl mb-8"
      >
        <img 
          src={siteConfig.bannerImageUrl} 
          alt="Banner"
          className="w-full h-auto aspect-[10/3] object-cover"
        />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatsCard icon={Users} title="Users" value="12,450" unit="active" />
        <StatsCard icon={Layers} title="Resources" value={resourcesData.length} unit="items" />
        <StatsCard icon={Eye} title="Views" value="45K" unit="today" />
        <StatsCard icon={Download} title="Sales" value="1.2K" unit="units" />
      </div>

      {/* Categories */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-main">Popular Categories</h2>
            <p className="text-sm text-text-muted">Browse items by category</p>
          </div>
          <button className="flex items-center gap-2 text-brand font-medium hover:underline text-sm">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData.slice(0, 3).map((cat) => (
            <motion.div 
              key={cat.id}
              whileHover={{ y: -5 }}
              className="bg-card-bg border border-border-subtle p-2 rounded-2xl shadow-sm cursor-pointer group"
            >
              <div className="aspect-[21/9] rounded-xl overflow-hidden mb-4">
                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-3 pb-3">
                <h3 className="font-bold text-text-main text-lg mb-1">{cat.name}</h3>
                <p className="text-xs text-text-muted line-clamp-1">{cat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-main">Featured Products</h2>
            <p className="text-sm text-text-muted">Handpicked for you</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {resourcesData.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/shop/product/${item.id}`)}
              className="bg-card-bg border border-border-subtle p-2 rounded-2xl shadow-sm cursor-pointer group"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="px-3 pb-3 space-y-2">
                <h3 className="font-bold text-text-main text-sm sm:text-base line-clamp-1 group-hover:text-brand transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-brand font-black">฿ {item.price}</div>
                  <div className="text-[10px] text-text-muted font-bold px-2 py-0.5 bg-slate-100 rounded-md">
                    STOCK: ∞
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
