import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useGameStore } from '../store/useGameStore';
import { ArcaneCard } from '../components/ui/ArcaneCard';
import { ArcaneButton } from '../components/ui/ArcaneButton';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import type { MarketListing, IntelScroll, ListingType } from '../../shared/types';
import {
  ShoppingBag, ScrollText, Users, Coins, Tag, X, Plus,
  Filter, TrendingUp, TrendingDown, Clock, CheckCircle,
  AlertCircle, ChevronDown, ChevronUp, Eye, History,
  BarChart3, ArrowRightLeft, Award
} from 'lucide-react';

type MarketTab = 'all' | 'intel_scroll' | 'spy_contract' | 'my';
type MarketSubView = 'listings' | 'histories' | 'trends' | 'my-trades';

const rarityColors = {
  common: 'border-gray-500 text-gray-400',
  rare: 'border-blue-500 text-blue-400',
  epic: 'border-purple-500 text-purple-400',
  legendary: 'border-gold-500 text-gold-400'
};

const rarityBg = {
  common: 'from-gray-900/30',
  rare: 'from-blue-900/30',
  epic: 'from-purple-900/30',
  legendary: 'from-amber-900/30'
};

const rarityCn = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };

export const MarketPage = () => {
  const { user, organization, isAuthenticated } = useAuthStore();
  const {
    listings, scrolls, isLoading, tradeHistories, myTrades, priceTrends,
    loadMarket, loadScrolls, buyListing, createListing
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<MarketTab>('all');
  const [subView, setSubView] = useState<MarketSubView>('listings');
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellType, setSellType] = useState<ListingType>('intel_scroll');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [suggestedRange, setSuggestedRange] = useState<[number, number] | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');

  useEffect(() => {
    if (isAuthenticated) {
      loadMarket();
      loadScrolls();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedItem && sellType === 'intel_scroll') {
      const scroll = scrolls.find(s => s.id === selectedItem);
      if (scroll) {
        const trend = priceTrends.find(t => t.rarity === scroll.rarity);
        if (trend && trend.volume > 0) {
          const avg = trend.average;
          setSuggestedRange([Math.round(avg * 0.85), Math.round(avg * 1.15)]);
          setPrice(Math.round(avg));
        } else {
          const basePrice = scroll.rarity === 'legendary' ? 10000 :
                           scroll.rarity === 'epic' ? 3000 :
                           scroll.rarity === 'rare' ? 1500 : 500;
          setSuggestedRange([Math.round(basePrice * 0.85), Math.round(basePrice * 1.15)]);
          setPrice(basePrice);
        }
      }
    }
  }, [selectedItem, sellType, scrolls, priceTrends]);

  const filteredListings = listings.filter(listing => {
    if (activeTab === 'all') return true;
    if (activeTab === 'my') return listing.sellerId === user?.id;
    return listing.type === activeTab;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const myListings = listings.filter(l => l.sellerId === user?.id);
  const availableScrolls = scrolls.filter(s =>
    !listings.some(l => l.type === 'intel_scroll' && l.itemId === s.id && l.sellerId === user?.id)
  );

  const handleBuy = async (listingId: string) => {
    setIsBuying(true);
    try {
      await buyListing(listingId);
    } finally {
      setIsBuying(false);
    }
  };

  const handleCreateListing = async () => {
    if (!selectedItem || price <= 0) return;
    setIsCreating(true);
    try {
      const result = await createListing(sellType, selectedItem, price);
      if (result) {
        setShowSellModal(false);
        setSelectedItem('');
        setPrice(0);
        setSuggestedRange(null);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getPriceColor = (listing: MarketListing) => {
    const [min, max] = listing.suggestedPriceRange;
    if (listing.price < min) return 'text-green-400';
    if (listing.price > max) return 'text-red-400';
    return 'text-gold-400';
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const SellModal = () => {
    if (!showSellModal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => { setShowSellModal(false); setSelectedItem(''); }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <ArcaneCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gold-400">
                上架商品
              </h2>
              <button
                onClick={() => { setShowSellModal(false); setSelectedItem(''); }}
                className="p-2 hover:bg-arcane-700/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-arcane-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gold-300 mb-2 font-medium">
                  商品类型
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSellType('intel_scroll'); setSelectedItem(''); }}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      sellType === 'intel_scroll'
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                        : 'border-arcane-600/50 bg-arcane-800/30 text-arcane-400 hover:border-arcane-500'
                    }`}
                  >
                    <ScrollText className="w-5 h-5" />
                    情报卷轴
                  </button>
                  <button
                    onClick={() => { setSellType('spy_contract'); setSelectedItem(''); }}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      sellType === 'spy_contract'
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                        : 'border-arcane-600/50 bg-arcane-800/30 text-arcane-400 hover:border-arcane-500'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    间谍契约
                  </button>
                </div>
              </div>

              {sellType === 'intel_scroll' && (
                <div>
                  <label className="block text-sm text-gold-300 mb-2 font-medium">
                    选择卷轴
                  </label>
                  {availableScrolls.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {availableScrolls.map((scroll: IntelScroll) => (
                        <motion.div
                          key={scroll.id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setSelectedItem(scroll.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedItem === scroll.id
                              ? 'border-gold-500 bg-gold-500/10'
                              : 'border-arcane-600/50 bg-arcane-800/30 hover:border-arcane-500'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-arcane-700 flex items-center justify-center border ${rarityColors[scroll.rarity]}`}>
                              <ScrollText className={`w-5 h-5 ${rarityColors[scroll.rarity].split(' ')[1]}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gold-300">{scroll.name}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[scroll.rarity]}`}>
                                  {rarityCn[scroll.rarity as keyof typeof rarityCn]}
                                </span>
                              </div>
                              <p className="text-xs text-arcane-400">{scroll.description}</p>
                            </div>
                            {selectedItem === scroll.id && (
                              <CheckCircle className="w-5 h-5 text-gold-500" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-arcane-400">
                      <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>没有可出售的卷轴</p>
                    </div>
                  )}
                </div>
              )}

              {selectedItem && suggestedRange && (
                <div>
                  <label className="block text-sm text-gold-300 mb-2 font-medium">
                    定价 (积分)
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-10 pr-4 py-3 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 placeholder-arcane-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
                      min="1"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-arcane-400">系统建议价格区间:</span>
                    <span className="font-mono text-gold-400">
                      {suggestedRange[0]} - {suggestedRange[1]} 积分
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {price < suggestedRange[0] && (
                      <div className="flex items-center gap-1 text-green-400 text-xs">
                        <TrendingDown className="w-3 h-3" />
                        低于建议价
                      </div>
                    )}
                    {price > suggestedRange[1] && (
                      <div className="flex items-center gap-1 text-red-400 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        高于建议价
                      </div>
                    )}
                    {price >= suggestedRange[0] && price <= suggestedRange[1] && (
                      <div className="flex items-center gap-1 text-gold-400 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        建议价格范围内
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <ArcaneButton
                  variant="secondary"
                  onClick={() => { setShowSellModal(false); setSelectedItem(''); }}
                >
                  取消
                </ArcaneButton>
                <ArcaneButton
                  onClick={handleCreateListing}
                  loading={isCreating}
                  disabled={!selectedItem || price <= 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  确认上架
                </ArcaneButton>
              </div>
            </div>
          </ArcaneCard>
        </motion.div>
      </motion.div>
    );
  };

  const ListingCard = ({ listing }: { listing: MarketListing }) => {
    const isMyListing = listing.sellerId === user?.id;
    const canAfford = organization && organization.intelPoints >= listing.price;

    return (
      <motion.div
        whileHover={{ y: -3 }}
        className={`arcane-card p-4 bg-gradient-to-br ${rarityBg[listing.itemRarity as keyof typeof rarityBg]} to-arcane-900/50 h-full flex flex-col`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-arcane-800 flex items-center justify-center border-2 ${rarityColors[listing.itemRarity as keyof typeof rarityColors]}`}>
              {listing.type === 'intel_scroll' ? (
                <ScrollText className={`w-6 h-6 ${rarityColors[listing.itemRarity as keyof typeof rarityColors].split(' ')[1]}`} />
              ) : (
                <Users className={`w-6 h-6 ${rarityColors[listing.itemRarity as keyof typeof rarityColors].split(' ')[1]}`} />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gold-300">{listing.itemName}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${rarityColors[listing.itemRarity as keyof typeof rarityColors]}`}>
                  {rarityCn[listing.itemRarity as keyof typeof rarityCn]}
                </span>
                <span className="text-xs text-arcane-400">
                  {listing.type === 'intel_scroll' ? '卷轴' : '契约'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-arcane-400">卖家</span>
            <span className="text-sm text-arcane-300 font-mono">{listing.sellerName}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-arcane-400">建议价格</span>
            <span className="text-sm text-arcane-300 font-mono">
              {listing.suggestedPriceRange[0]}-{listing.suggestedPriceRange[1]}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-arcane-800/50 rounded-lg mb-3">
            <span className="text-arcane-300">售价</span>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gold-500" />
              <span className={`font-display text-xl font-bold ${getPriceColor(listing)}`}>
                {listing.price}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-arcane-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(listing.createdAt).toLocaleDateString('zh-CN')}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {Math.floor(Math.random() * 100) + 10}
            </div>
          </div>
        </div>

        {isMyListing ? (
          <div className="mt-3 pt-3 border-t border-gold-500/20">
            <div className="text-center text-arcane-400 text-sm">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
              我的商品
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-gold-500/20">
            <ArcaneButton
              className="w-full"
              onClick={() => handleBuy(listing.id)}
              loading={isBuying}
              disabled={!canAfford}
              variant={canAfford ? 'primary' : 'secondary'}
            >
              {canAfford ? (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  购买
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  积分不足
                </>
              )}
            </ArcaneButton>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text mb-1">
            情报市场
          </h1>
          <p className="text-arcane-400">交易情报卷轴和间谍契约，积累财富</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="arcane-card px-4 py-2 flex items-center gap-2">
            <Coins className="w-4 h-4 text-gold-500" />
            <span className="text-sm text-gold-400 font-mono">
              {organization?.intelPoints || 0} 积分
            </span>
          </div>
          <ArcaneButton onClick={() => setShowSellModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            上架商品
          </ArcaneButton>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex bg-arcane-800/50 rounded-lg p-1 flex-1">
          {(['all', 'intel_scroll', 'spy_contract', 'my'] as MarketTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSubView('listings'); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab && subView === 'listings'
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-arcane-900'
                  : 'text-arcane-400 hover:text-gold-400'
              }`}
            >
              {tab === 'all' && '全部商品'}
              {tab === 'intel_scroll' && <><ScrollText className="w-4 h-4" /> 情报卷轴</>}
              {tab === 'spy_contract' && <><Users className="w-4 h-4" /> 间谍契约</>}
              {tab === 'my' && <><Tag className="w-4 h-4" /> 我的商品 ({myListings.length})</>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-arcane-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 bg-arcane-800/50 border border-gold-500/30 rounded-lg text-gold-200 text-sm focus:outline-none focus:border-gold-500"
          >
            <option value="newest">最新上架</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        {[
          { id: 'listings', label: '当前上架', icon: ShoppingBag },
          { id: 'histories', label: '最近成交', icon: History },
          { id: 'my-trades', label: '我的交易', icon: ArrowRightLeft },
          { id: 'trends', label: '价格走势', icon: BarChart3 }
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setSubView(v.id as MarketSubView)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              subView === v.id
                ? 'bg-arcane-700/50 text-gold-400 border border-gold-500/30'
                : 'text-arcane-400 hover:text-gold-400'
            }`}
          >
            <v.icon className="w-4 h-4" />
            {v.label}
          </button>
        ))}
      </div>

      {subView === 'listings' && (
        <>
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <ArcaneCard className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-arcane-500 opacity-50" />
              <h3 className="text-xl font-bold text-gold-400 mb-2">
                {activeTab === 'my' ? '暂无上架商品' : '暂无商品'}
              </h3>
              <p className="text-arcane-400 mb-6">
                {activeTab === 'my' ? '点击右上角按钮上架你的商品' : '请稍后再来查看新的商品'}
              </p>
              {activeTab === 'my' && (
                <ArcaneButton onClick={() => setShowSellModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  立即上架
                </ArcaneButton>
              )}
            </ArcaneCard>
          )}
        </>
      )}

      {subView === 'histories' && (
        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            最近成交记录
          </h2>
          {tradeHistories.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {tradeHistories.map((h: any) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-arcane-800/30 rounded-lg border border-arcane-600/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${rarityColors[h.itemRarity as keyof typeof rarityColors]}`}>
                      {h.type === 'intel_scroll' ? (
                        <ScrollText className={`w-5 h-5 ${rarityColors[h.itemRarity as keyof typeof rarityColors].split(' ')[1]}`} />
                      ) : (
                        <Users className={`w-5 h-5 ${rarityColors[h.itemRarity as keyof typeof rarityColors].split(' ')[1]}`} />
                      )}
                    </div>
                    <div>
                      <p className="text-gold-300 font-medium">{h.itemName}</p>
                      <p className="text-xs text-arcane-400">
                        <span className="text-blue-400">{h.buyerName}</span> 从 <span className="text-amber-400">{h.sellerName}</span> 购买
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-gold-400">
                      {h.price.toLocaleString()} 积分
                    </p>
                    <p className="text-xs text-arcane-500">
                      {new Date(h.timestamp).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-arcane-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无成交记录</p>
            </div>
          )}
        </ArcaneCard>
      )}

      {subView === 'my-trades' && (
        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            我的交易记录
          </h2>
          {myTrades.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {myTrades.map((h: any) => {
                const isBuyer = h.buyerId === organization?.id;
                const isSeller = h.sellerId === organization?.id;
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isBuyer
                        ? 'bg-blue-900/20 border-blue-500/30'
                        : 'bg-green-900/20 border-green-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        isBuyer ? 'border-blue-400 bg-blue-900/30' : 'border-green-400 bg-green-900/30'
                      }`}>
                        {isBuyer ? (
                          <ShoppingBag className="w-5 h-5 text-blue-400" />
                        ) : (
                          <Coins className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-gold-300 font-medium">{h.itemName}</p>
                        <p className="text-xs text-arcane-400">
                          {isBuyer
                            ? `我从 ${h.sellerName} 购买`
                            : `我卖给 ${h.buyerName}`}
                          <span className="ml-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full border ${rarityColors[h.itemRarity as keyof typeof rarityColors]}`}>
                              {rarityCn[h.itemRarity as keyof typeof rarityCn]}
                            </span>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-lg font-bold ${isBuyer ? 'text-red-400' : 'text-green-400'}`}>
                        {isBuyer ? '-' : '+'}{h.price.toLocaleString()} 积分
                      </p>
                      <p className="text-xs text-arcane-500">
                        {new Date(h.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-arcane-400">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无交易记录</p>
            </div>
          )}
        </ArcaneCard>
      )}

      {subView === 'trends' && (
        <ArcaneCard className="p-6">
          <h2 className="font-display text-xl font-bold text-gold-400 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            近7天成交价格走势
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {priceTrends.map(trend => (
              <div key={trend.rarity} className="p-4 bg-arcane-800/30 rounded-lg border border-arcane-600/30">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${rarityColors[trend.rarity as keyof typeof rarityColors]}`}>
                    {rarityCn[trend.rarity as keyof typeof rarityCn]}
                  </span>
                  <span className="text-sm text-arcane-400">成交量 {trend.volume}</span>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-arcane-400 mb-1">成交均价</p>
                  <p className="font-mono text-2xl font-bold text-gold-400">
                    {trend.volume > 0 ? Math.round(trend.average).toLocaleString() : '-'}
                  </p>
                </div>
                {trend.prices.length > 0 && (
                  <div className="h-16 flex items-end gap-1">
                    {trend.prices.slice(-10).map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(10, (p / Math.max(...trend.prices)) * 100)}%` }}
                        className="flex-1 bg-gradient-to-t from-gold-600 to-gold-400 rounded-t"
                      />
                    ))}
                  </div>
                )}
                {trend.prices.length === 0 && (
                  <p className="text-sm text-arcane-500 italic">暂无成交数据</p>
                )}
              </div>
            ))}
          </div>
        </ArcaneCard>
      )}

      <AnimatePresence>
        {showSellModal && <SellModal />}
      </AnimatePresence>
    </div>
  );
};
