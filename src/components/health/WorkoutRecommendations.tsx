'use client';

import { useState, useEffect } from 'react';
import { Video, Flame, Coffee } from 'lucide-react';
import { BioCycle, SleepLog, Workout } from '@prisma/client';
import { searchYoutubeWorkouts, DynamicYoutubeWorkout } from '@/lib/actions/youtube.actions';

interface Props {
  cycle?: BioCycle | null;
  sleepLog?: SleepLog | null;
  workouts?: Workout[];
}

export default function WorkoutRecommendations({ cycle, sleepLog, workouts = [] }: Props) {
  const [recommendations, setRecommendations] = useState<DynamicYoutubeWorkout[]>([]);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'high'>('high');
  const [preferredTags, setPreferredTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isLowEnergy = false;
    
    if (cycle) {
      const daysSinceStart = Math.floor((new Date().getTime() - new Date(cycle.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const cycleLen = cycle.cycleLength || 28;
      const currentDay = (daysSinceStart % cycleLen) + 1;
      if (currentDay <= 5 || currentDay >= cycleLen - 3) {
        isLowEnergy = true;
      }
    }

    if (sleepLog && (sleepLog.qualityScore ?? 10) < 6) {
      isLowEnergy = true;
    }

    setEnergyLevel(isLowEnergy ? 'low' : 'high');

    const fetchVideos = async () => {
      setLoading(true);
      const recentTypes = workouts.map(w => w.type);
      const tags = Array.from(new Set(recentTypes));
      setPreferredTags(tags);

      let query = '';
      if (tags.length > 0) {
        // Query dựa trên sở thích cá nhân
        query = tags.slice(0, 2).join(' ');
      } else {
        // Query dựa trên mức năng lượng
        query = isLowEnergy ? 'Yoga stretching relax' : 'HIIT full body intense';
      }

      const results = await searchYoutubeWorkouts(query);
      setRecommendations(results);
      setLoading(false);
    };

    fetchVideos();
  }, [cycle, sleepLog, workouts]);

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={20} color="#ef4444" /> Smart Workout Suggestions
        </h3>
        {energyLevel === 'low' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
            <Coffee size={14} /> Trạng thái phục hồi (Low Energy)
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#fb923c', background: 'rgba(251, 146, 60, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
            <Flame size={14} /> Trạng thái sung mãn (High Energy)
          </div>
        )}
      </div>

      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        {energyLevel === 'low' 
          ? preferredTags.length > 0
            ? `Hệ thống nhận thấy bạn đang thiếu ngủ hoặc trong kỳ kinh nguyệt, nhưng vì bạn đam mê ${preferredTags.slice(0, 2).join(', ')}, đây là các gợi ý cho bạn. Tuy nhiên hãy tập vừa sức nhé!`
            : 'Hệ thống nhận thấy bạn đang thiếu ngủ hoặc trong kỳ kinh nguyệt. Hãy thử các bài tập nhẹ nhàng sau để thư giãn nhé!'
          : preferredTags.length > 0 
            ? `Dựa trên sở thích tập luyện gần đây (${preferredTags.slice(0, 2).join(', ')}), đây là các bài tập bứt phá dành cho bạn:`
            : 'Dựa trên chu kỳ và giấc ngủ tuyệt vời của bạn, đây là lúc bứt phá giới hạn! Hãy thử những bài tập này:'
        }
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Đang cá nhân hóa video cho bạn...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {recommendations.map(video => (
            <div key={video.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.id}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ color: '#fff', textDecoration: 'none' }}
                    title="Mở trên YouTube"
                  >
                    {video.title} ↗
                  </a>
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{video.channel}</span>
                  <span>{video.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
