import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Link2, Github, Twitter, Edit3, UserPlus, UserMinus, MessageSquare, Star, Briefcase, Calendar } from 'lucide-react';
import { userAPI, postAPI, followAPI, connectionAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
import { PostSkeleton } from '../components/common/SkeletonLoader';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.username === username;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      userAPI.getProfile(username),
      postAPI.getUserPosts?.(username, { limit: 20 }) || Promise.resolve({ data: { posts: [] } }),
    ]).then(([profileData, postsData]) => {
      setProfile(profileData.data.user);
      setIsFollowing(profileData.data.isFollowing);
      setPosts(postsData.data.posts || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(profile._id);
        setIsFollowing(false);
        setProfile((p) => ({ ...p, followersCount: p.followersCount - 1 }));
      } else {
        await followAPI.followUser(profile._id);
        setIsFollowing(true);
        setProfile((p) => ({ ...p, followersCount: p.followersCount + 1 }));
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-dark-border rounded-2xl" />
        <div className="h-4 bg-dark-border rounded w-48" />
        <div className="h-3 bg-dark-border rounded w-64" />
      </div>
    </div>
  );

  if (!profile) return (
    <div className="p-6 text-center">
      <p className="text-dark-muted">User not found</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-4">
      {/* Banner */}
      <div className="h-32 bg-gradient-to-br from-primary-500/20 via-cyan-500/10 to-dark-bg" />

      {/* Profile Header */}
      <div className="px-6">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div className="relative">
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} className="w-20 h-20 avatar border-4 border-dark-bg" />
              : <div className="w-20 h-20 rounded-full border-4 border-dark-bg bg-primary-500/20 flex items-center justify-center">
                  <span className="text-primary-400 text-2xl font-bold">{profile.name?.[0]}</span>
                </div>
            }
            {profile.isOnline && <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-bg" />}
          </div>

          <div className="flex gap-2">
            {isOwner ? (
              <Link to="/profile/edit" className="btn-secondary text-sm py-2">
                <Edit3 size={15} />Edit Profile
              </Link>
            ) : (
              <>
                <Link to={`/chat`} className="btn-secondary text-sm py-2">
                  <MessageSquare size={15} />Message
                </Link>
                <button onClick={handleFollow}
                  className={isFollowing ? 'btn-secondary text-sm py-2' : 'btn-primary text-sm py-2'}>
                  {isFollowing ? <><UserMinus size={15} />Unfollow</> : <><UserPlus size={15} />Follow</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold text-dark-text">{profile.name}</h1>
            {profile.openToWork && (
              <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">Open to Work</span>
            )}
          </div>
          <p className="text-dark-muted text-sm">@{profile.username}</p>
          {profile.headline && <p className="text-dark-text mt-1 text-sm">{profile.headline}</p>}
          {profile.bio && <p className="text-dark-muted mt-2 text-sm leading-relaxed">{profile.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-dark-muted">
            {profile.location && <span className="flex items-center gap-1"><MapPin size={14} />{profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary-400"><Link2 size={14} />{profile.website}</a>}
            {profile.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary-400"><Github size={14} />{profile.githubUsername}</a>}
            {profile.twitterHandle && <a href={`https://twitter.com/${profile.twitterHandle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary-400"><Twitter size={14} />@{profile.twitterHandle}</a>}
            <span className="flex items-center gap-1"><Calendar size={14} />Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div>
              <span className="font-display font-bold text-dark-text">{profile.postsCount}</span>
              <span className="text-dark-muted text-sm ml-1">Posts</span>
            </div>
            <div>
              <span className="font-display font-bold text-dark-text">{profile.followersCount}</span>
              <span className="text-dark-muted text-sm ml-1">Followers</span>
            </div>
            <div>
              <span className="font-display font-bold text-dark-text">{profile.followingCount}</span>
              <span className="text-dark-muted text-sm ml-1">Following</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-dark-muted mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => {
                const endorsementCount = profile.endorsements?.get?.(skill)?.length || 0;
                return (
                  <div key={skill} className="skill-tag flex items-center gap-1.5">
                    {skill}
                    {endorsementCount > 0 && (
                      <span className="text-xs bg-primary-500/20 px-1.5 py-0.5 rounded-full">{endorsementCount}</span>
                    )}
                    {!isOwner && (
                      <button
                        onClick={() => userAPI.endorseSkill(profile._id, skill).then(() => toast.success(`Endorsed ${skill}!`)).catch(() => {})}
                        className="ml-1 text-primary-400/60 hover:text-primary-400 transition-colors"
                        title="Endorse this skill"
                      >
                        <Star size={10} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-dark-border">
          <div className="flex gap-0">
            {['posts', 'projects', 'experience'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-all border-b-2 ${
                  activeTab === tab ? 'border-primary-500 text-primary-400' : 'border-transparent text-dark-muted hover:text-dark-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pt-4 space-y-4">
        {activeTab === 'posts' && (
          posts.length === 0
            ? <p className="text-dark-muted text-center py-8">No posts yet</p>
            : posts.map((post) => <PostCard key={post._id} post={post} />)
        )}

        {activeTab === 'projects' && (
          profile.projects?.length === 0
            ? <p className="text-dark-muted text-center py-8">No projects added</p>
            : profile.projects?.map((project) => (
                <div key={project._id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-dark-text">{project.title}</h4>
                    <div className="flex gap-2">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-dark-muted hover:text-primary-400"><Github size={16} /></a>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-dark-muted hover:text-primary-400"><Link2 size={16} /></a>}
                    </div>
                  </div>
                  {project.description && <p className="text-dark-muted text-sm mt-1">{project.description}</p>}
                  {project.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.techStack.map((t) => <span key={t} className="skill-tag">{t}</span>)}
                    </div>
                  )}
                </div>
              ))
        )}

        {activeTab === 'experience' && (
          profile.experience?.length === 0
            ? <p className="text-dark-muted text-center py-8">No experience added</p>
            : profile.experience?.map((exp) => (
                <div key={exp._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-text">{exp.title}</h4>
                      <p className="text-dark-muted text-sm">{exp.company} · {exp.location}</p>
                      <p className="text-xs text-dark-muted mt-0.5">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} —{' '}
                        {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      {exp.description && <p className="text-dark-text text-sm mt-2">{exp.description}</p>}
                    </div>
                  </div>
                </div>
              ))
        )}
      </div>
    </div>
  );
}
