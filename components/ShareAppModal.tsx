"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Share2, Users, Mail, MessageCircle, Copy, Check, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'sent' | 'registered' | 'declined';
  shareDate?: string;
  registerDate?: string;
}

interface ShareStats {
  totalShared: number;
  successfulReferrals: number;
  pendingInvites: number;
  lastShareDate?: string;
}

export function ShareAppModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'share' | 'contacts' | 'stats'>('share');
  const [shareMethod, setShareMethod] = useState<'email' | 'message' | 'link'>('link');
  const [contacts, setContacts] = useState<ShareContact[]>([
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', status: 'sent', shareDate: '2025-01-18' },
    { id: '2', name: 'Mike Chen', email: 'mike.chen@email.com', status: 'registered', shareDate: '2025-01-15', registerDate: '2025-01-17' },
    { id: '3', name: 'Emma Davis', email: 'emma.d@email.com', status: 'pending' },
  ]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [shareMessage, setShareMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareStats: ShareStats = {
    totalShared: contacts.length,
    successfulReferrals: contacts.filter(c => c.status === 'registered').length,
    pendingInvites: contacts.filter(c => c.status === 'pending').length,
    lastShareDate: contacts[0]?.shareDate
  };

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?ref=${user?.uid || 'anonymous'}`;

  const handleShare = async (method: 'email' | 'message' | 'link') => {
    const message = shareMessage || "I've discovered this amazing AI-powered mystical platform called FutureSeer! It combines ancient wisdom with modern AI to provide personalized divination insights. You should check it out! ✨🔮";

    switch (method) {
      case 'email':
        // Simulate email sharing
        toast({
          title: "Email Shared! 📧",
          description: "Your invitation has been sent via email",
        });
        break;
      case 'message':
        // Simulate SMS sharing
        toast({
          title: "Message Sent! 💬",
          description: "Your invitation has been sent via message",
        });
        break;
      case 'link':
        try {
          await navigator.clipboard.writeText(shareLink);
          setCopied(true);
          toast({
            title: "Link Copied! 📋",
            description: "Share link copied to clipboard",
          });
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast({
            title: "Copy Failed",
            description: "Please copy the link manually",
            variant: "destructive"
          });
        }
        break;
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email",
        variant: "destructive"
      });
      return;
    }

    const contact: ShareContact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      status: 'pending'
    };

    setContacts([contact, ...contacts]);
    setNewContact({ name: '', email: '', phone: '' });
    
    toast({
      title: "Contact Added! 👥",
      description: `${contact.name} has been added to your share list`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/40';
      case 'sent': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40';
      case 'pending': return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40';
      case 'declined': return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/40';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-blue-700/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh]">
        {/* Animated mystical glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 via-blue-500/5 to-amber-500/8 rounded-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-blue-500/5 rounded-2xl"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-amber-400/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-12 right-8 w-1 h-1 bg-blue-400/50 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-8 left-10 w-1 h-1 bg-amber-300/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-row items-center justify-between p-6 border-b border-amber-500/30 relative">
            {/* Mystical orb behind title */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-amber-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-lg">
                <Share2 className="w-6 h-6 text-amber-300" />
              </div>
              <h2 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-blue-400 to-amber-600 animate-in slide-in-from-left-2 duration-500">
                Share FutureSeer
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-300 relative z-10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="flex space-x-2 bg-gradient-to-r from-blue-800/60 to-blue-700/60 rounded-xl p-1 backdrop-blur-sm border border-amber-500/20">
              <Button
                variant={activeTab === 'share' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('share')}
                className={`flex-1 transition-all duration-300 ${
                  activeTab === 'share' 
                    ? 'bg-gradient-to-r from-amber-500/30 to-blue-500/30 text-amber-200 shadow-lg shadow-amber-500/20 rounded-lg' 
                    : 'text-gray-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg'
                }`}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant={activeTab === 'contacts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('contacts')}
                className={`flex-1 transition-all duration-300 ${
                  activeTab === 'contacts' 
                    ? 'bg-gradient-to-r from-amber-500/30 to-blue-500/30 text-amber-200 shadow-lg shadow-amber-500/20 rounded-lg' 
                    : 'text-gray-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Contacts ({contacts.length})
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('stats')}
                className={`flex-1 transition-all duration-300 ${
                  activeTab === 'stats' 
                    ? 'bg-gradient-to-r from-amber-500/30 to-blue-500/30 text-amber-200 shadow-lg shadow-amber-500/20 rounded-lg' 
                    : 'text-gray-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg'
                }`}
              >
                <Star className="w-4 h-4 mr-2" />
                Stats
              </Button>
            </div>

            {/* Share Tab */}
            {activeTab === 'share' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <div>
                  <label className="text-sm font-medium text-amber-200 mb-3 block">
                    ✨ Share Method ✨
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={shareMethod === 'email' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShareMethod('email')}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        shareMethod === 'email' 
                          ? 'bg-gradient-to-r from-amber-500/30 to-blue-500/30 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                          : 'border-amber-500/30 text-gray-300 hover:border-amber-500/50 hover:bg-amber-500/10'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                    <Button
                      variant={shareMethod === 'message' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShareMethod('message')}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        shareMethod === 'message' 
                          ? 'bg-gradient-to-r from-amber-500/30 to-blue-500/30 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                          : 'border-amber-500/30 text-gray-300 hover:border-amber-500/50 hover:bg-amber-500/10'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button
                      variant={shareMethod === 'link' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setShareMethod('link')}
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        shareMethod === 'link' 
                          ? 'bg-gradient-to-r from-amber-500/30 to-blue-500/30 text-amber-200 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                          : 'border-amber-500/30 text-gray-300 hover:border-amber-500/50 hover:bg-amber-500/10'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      Link
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-amber-200 mb-3 block">
                    💫 Custom Message (Optional) 💫
                  </label>
                  <Textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    placeholder="Add a personal message to your invitation..."
                    className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-amber-500/30 text-gray-300 placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40"
                    rows={3}
                  />
                </div>

                {shareMethod === 'link' && (
                  <div>
                    <label className="text-sm font-medium text-amber-200 mb-3 block">
                      🔗 Share Link 🔗
                    </label>
                    <div className="flex gap-3">
                      <Input
                        value={shareLink}
                        readOnly
                        className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-amber-500/30 text-gray-300 rounded-xl backdrop-blur-sm"
                      />
                      <Button
                        onClick={() => handleShare('link')}
                        className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleShare(shareMethod)}
                  className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  ✨ Share FutureSeer ✨
                </Button>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-4">
                  <h3 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-blue-400 to-amber-600">
                    👥 Add New Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-amber-500/30 text-gray-300 placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40"
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-amber-500/30 text-gray-300 placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40"
                    />
                  </div>
                  <Input
                    placeholder="Phone (optional)"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-amber-500/30 text-gray-300 placeholder-gray-400 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40"
                  />
                  <Button 
                    onClick={addContact} 
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    ✨ Add Contact ✨
                  </Button>
                </div>

                <div className="space-y-4">
                                     <h3 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-blue-400 to-amber-600">
                     📋 Your Contacts
                   </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {contacts.map((contact, index) => (
                      <div 
                        key={contact.id} 
                                                 className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div>
                          <p className="font-semibold text-gray-200">{contact.name}</p>
                          <p className="text-sm text-gray-400">{contact.email}</p>
                        </div>
                        <Badge className={`${getStatusColor(contact.status)} rounded-full px-3 py-1 font-medium`}>
                          {contact.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="grid grid-cols-3 gap-4">
                                     <div className="text-center p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10">
                     <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">{shareStats.totalShared}</h4>
                     <p className="text-gray-400 text-sm font-medium">Total Shared</p>
                   </div>
                                     <div className="text-center p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10">
                     <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">{shareStats.successfulReferrals}</h4>
                     <p className="text-gray-400 text-sm font-medium">Successful</p>
                   </div>
                                     <div className="text-center p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10">
                     <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">{shareStats.pendingInvites}</h4>
                     <p className="text-gray-400 text-sm font-medium">Pending</p>
                   </div>
                </div>

                                 <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-amber-500/20 backdrop-blur-sm">
                   <h4 className="font-semibold text-amber-200 mb-3 text-lg">📊 Recent Activity</h4>
                   <div className="space-y-2">
                     <p className="text-gray-300 text-sm">
                       <span className="text-amber-300">Last share:</span> {shareStats.lastShareDate ? 
                         new Date(shareStats.lastShareDate).toLocaleDateString() : 
                         'No recent activity'}
                     </p>
                     <p className="text-gray-300 text-sm">
                       <span className="text-amber-300">Success rate:</span> {shareStats.totalShared > 0 ? 
                         Math.round((shareStats.successfulReferrals / shareStats.totalShared) * 100) : 0}%
                     </p>
                   </div>
                 </div>

                                 <div className="text-center p-6 bg-gradient-to-r from-amber-500/15 to-blue-500/15 rounded-xl border border-amber-500/30 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20">
                   <div className="w-12 h-12 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Star className="w-6 h-6 text-amber-300" />
                   </div>
                   <h4 className="text-xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-blue-400 to-amber-600 mb-2">Community Builder</h4>
                   <p className="text-gray-300 text-sm">You're helping grow our mystical community! ✨🌟</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 