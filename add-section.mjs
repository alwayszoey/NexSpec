import fs from 'fs';

const insertCode = `
                {/* ---------------------------------------------------- */}
                {/* RECOMMENDED PRODUCTS SECTION */}
                {/* ---------------------------------------------------- */}
                <div className="w-full relative mt-8 pt-6 border-t border-border-subtle">
                  <div className="flex items-center space-x-2 justify-between">
                    <div>
                      <h3 className="font-semibold text-xl sm:text-2xl text-text-main line-clamp-1">สินค้าที่คุณอาจสนใจ</h3>
                      <p className="text-xs sm:text-sm text-text-muted mt-1 inline-flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand" /> แนะนำสินค้ายอดฮิต
                      </p>
                    </div>
                    <div>
                      <button 
                        onClick={() => { setActiveCategory('ALL'); setCurrentView('category'); }}
                        className="inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 py-1.5 px-3 text-xs sm:text-sm rounded-xl bg-card-bg text-text-main border border-border-subtle hover:bg-bg-app shadow-sm gap-1.5"
                      >
                        <ShoppingCart className="w-4 h-4" /> ดูทั้งหมด
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 pb-12">
                    {resourcesData.slice(0, 5).map((item, index) => {
                       return (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          key={"rec-" + item.id}
                          onClick={() => handleOpenDetails(item)}
                          className="relative rounded-md sm:rounded-lg group overflow-hidden cursor-pointer p-0 bg-transparent flex flex-col shadow-sm"
                        >
                          <div className="relative flex-1 z-10 bg-card-bg border border-border-subtle group-hover:border-brand transition-colors duration-200 rounded-md sm:rounded-lg p-1.5 sm:p-2 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_8px_30px_rgba(106,154,251,0.12)]">
                            
                            {appStats.downloads >= 100 && (
                              <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1 border border-orange-300/40">
                                  <Flame className="w-3 h-3 text-white fill-white" />
                                  <span className="text-[10px] sm:text-[11px] font-semibold text-white">ยอดฮิต</span>
                                </div>
                              </div>
                            )}

                            <div className="relative z-20 rounded-md overflow-hidden bg-bg-app aspect-square">
                              <motion.img 
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                src={item.imageUrl} 
                                alt={getLocalized(item.title)} 
                                className="w-full h-full object-cover sm:object-contain object-center transition-opacity duration-500 ease-out" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                            
                            <div className="relative z-20 mt-2 flex-1 flex flex-col">
                              <h3 className="text-sm sm:text-base font-bold text-text-main line-clamp-1 group-hover:text-brand transition-colors">{getLocalized(item.title)}</h3>
                              <p className="text-[11px] sm:text-xs text-brand line-clamp-1 mt-1 font-medium bg-brand/10 w-fit px-1.5 py-0.5 rounded-md border border-brand/20">
                                ✦ {getLocalized(item.shortDescription) || 'คุณสมบัติพิเศษ'}
                              </p>
                              
                              <div className="flex items-center mt-3 justify-between space-x-2 pt-2 border-t border-border-subtle mt-auto">
                                <p className="text-xs sm:text-sm font-medium text-text-main inline-flex items-center">
                                  <span className="text-lg sm:text-xl font-bold leading-none">฿</span>
                                  <span className="text-lg sm:text-xl font-bold leading-none text-brand ml-[1px]">0</span>
                                </p>
                                <p className="text-[10px] sm:text-[11px] rounded px-1.5 py-0.5 border inline-flex items-center gap-1 border-border-subtle text-text-muted bg-bg-app">
                                  <Archive className="w-3 h-3 shrink-0" /> คงเหลือ ∞
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(item); }}
                                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-medium outline-none select-none transition-[transform,background-color,color,border-color,box-shadow,opacity] duration-150 py-1.5 px-3 w-full rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_14px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] group"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0 [transform:perspective(700px)_rotateY(0deg)] [transform-style:preserve-3d] transition-transform duration-700 group-hover:[transform:perspective(700px)_rotateY(360deg)]" /> ซื้อสินค้า
                                </button>
                              </div>

                              <div className="mt-2.5 flex items-center justify-center">
                                <p className="text-[10px] sm:text-[11px] inline-flex items-center gap-1 text-text-muted">
                                  <Flame className="w-3 h-3 shrink-0 text-orange-500 fill-orange-500" /> ขายแล้ว {appStats.downloads + index * 10} ชิ้น
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                       )
                    })}
                  </div>
                </div>
`;

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf-8');

// The place we want to insert is right after:
/*
                      })}
                    </div>
                  </div>
                </section>
*/
content = content.replace(
  `                      })}
                    </div>
                  </div>
                </section>`,
  `                      })}
                    </div>
                  </div>
                </section>\n${insertCode}`
);

fs.writeFileSync(file, content);
