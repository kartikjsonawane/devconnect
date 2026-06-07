import { useState, useRef } from 'react';
import { Image, Code, Send, X, Sparkles } from 'lucide-react';
import { postAPI, aiAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { usePostStore } from '../../store/postStore';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';

export default function CreatePost() {
  const { user } = useAuthStore();
  const { prependPost } = usePostStore();
  const [content, setContent] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState({ code: '', language: 'javascript' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const fileRef = useRef();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (showCode && codeSnippet.code) {
        formData.append('codeSnippet', JSON.stringify(codeSnippet));
      }
      images.forEach((img) => formData.append('images', img));
      const data = await postAPI.createPost(formData);
      prependPost(data.data.post);
      setContent('');
      setCodeSnippet({ code: '', language: 'javascript' });
      setImages([]);
      setPreviews([]);
      setShowCode(false);
      setIdeas([]);
      setShowIdeas(false);
      toast.success('Post created!');
    } catch (err) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchIdeas = async () => {
    if (showIdeas) { setShowIdeas(false); return; }
    setLoadingIdeas(true);
    setShowIdeas(true);
    try {
      const res = await aiAPI.getPostIdeas();
      setIdeas(res.data.ideas || []);
    } catch {
      toast.error('Could not load ideas');
      setShowIdeas(false);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const applyIdea = (idea) => {
    setContent(idea + ' ');
    setShowIdeas(false);
    setIdeas([]);
  };

  return (
    <div className="card p-5 mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar user={user} size="md" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what you're building, learning, or thinking..."
              className="input resize-none min-h-20 text-sm"
              rows={3}
              maxLength={2000}
            />

            {showIdeas && (
              <div className="mt-3 rounded-xl border border-primary-500/30 bg-primary-500/5 overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-primary-500/20">
                  <Sparkles size={13} className="text-primary-400" />
                  <span className="text-xs font-medium text-primary-400">Ideas based on your skills</span>
                  <button type="button" onClick={() => setShowIdeas(false)} className="ml-auto text-dark-muted hover:text-dark-text">
                    <X size={13} />
                  </button>
                </div>
                {loadingIdeas ? (
                  <div className="px-3 py-4 space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-dark-border rounded animate-pulse" style={{ width: (70 + i * 5) + '%' }} />
                    ))}
                  </div>
                ) : (
                  <ul className="divide-y divide-primary-500/10">
                    {ideas.map((idea, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => applyIdea(idea)}
                          className="w-full text-left px-3 py-2.5 text-xs text-dark-text hover:bg-primary-500/10 transition-colors"
                        >
                          {idea}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {showCode && (
              <div className="mt-3 bg-dark-bg rounded-xl border border-dark-border overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border">
                  <select
                    value={codeSnippet.language}
                    onChange={(e) => setCodeSnippet((prev) => ({ ...prev, language: e.target.value }))}
                    className="bg-transparent text-xs text-dark-muted focus:outline-none"
                  >
                    {['javascript','typescript','python','go','rust','java','cpp','sql','bash'].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowCode(false)} className="ml-auto text-dark-muted hover:text-dark-text">
                    <X size={14} />
                  </button>
                </div>
                <textarea
                  value={codeSnippet.code}
                  onChange={(e) => setCodeSnippet((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="// Paste your code here..."
                  className="w-full bg-transparent text-xs font-mono text-dark-text p-3 resize-none focus:outline-none min-h-24"
                />
              </div>
            )}

            {previews.length > 0 && (
              <div className={'grid gap-2 mt-3' + (previews.length > 1 ? ' grid-cols-2' : '')}>
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="rounded-xl w-full object-cover max-h-48" />
                    <button
                      type="button"
                      onClick={() => {
                        setImages((p) => p.filter((_, j) => j !== i));
                        setPreviews((p) => p.filter((_, j) => j !== i));
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-dark-bg/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="p-2 rounded-xl text-dark-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                >
                  <Image size={18} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className={'p-2 rounded-xl transition-all ' + (showCode ? 'text-primary-400 bg-primary-500/10' : 'text-dark-muted hover:text-primary-400 hover:bg-primary-500/10')}
                >
                  <Code size={18} />
                </button>
                <button
                  type="button"
                  onClick={fetchIdeas}
                  title="AI post ideas"
                  className={'p-2 rounded-xl transition-all ' + (showIdeas ? 'text-primary-400 bg-primary-500/10' : 'text-dark-muted hover:text-primary-400 hover:bg-primary-500/10')}
                >
                  <Sparkles size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={'text-xs ' + (content.length > 1900 ? 'text-red-400' : 'text-dark-muted')}>
                  {content.length}/2000
                </span>
                <button type="submit" disabled={!content.trim() || isSubmitting} className="btn-primary text-sm py-1.5">
                  <Send size={15} />
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
