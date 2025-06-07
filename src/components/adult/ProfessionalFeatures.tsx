'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { database } from '@/lib/firebase';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';

interface ProfessionalFeaturesProps {
  sessionId: string;
}

export default function ProfessionalFeatures({ sessionId }: ProfessionalFeaturesProps) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'breakout',
      title: '소그룹 토론방',
      description: '참여자를 소그룹으로 나누어 집중 토론',
      icon: '👥',
      component: <BreakoutRooms sessionId={sessionId} />
    },
    {
      id: 'poll',
      title: '실시간 투표',
      description: '즉석 설문과 의견 수렴',
      icon: '📊',
      component: <LivePolling sessionId={sessionId} />
    },
    {
      id: 'resource',
      title: '자료 공유',
      description: '문서, 프레젠테이션 실시간 공유',
      icon: '📁',
      component: <ResourceSharing sessionId={sessionId} />
    },
    {
      id: 'network',
      title: '네트워킹',
      description: '참여자 간 연결 및 정보 교환',
      icon: '🤝',
      component: <NetworkingHub sessionId={sessionId} />
    },
    {
      id: 'certificate',
      title: '수료증 발급',
      description: '참여 인증서 자동 생성',
      icon: '🏆',
      component: <CertificateGenerator sessionId={sessionId} />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {features.map((feature) => (
          <motion.button
            key={feature.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            className={`p-4 rounded-lg text-center transition-all ${
              activeFeature === feature.id
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-sm">{feature.title}</h3>
            <p className="text-xs mt-1 opacity-80">{feature.description}</p>
          </motion.button>
        ))}
      </div>

      {activeFeature && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          {features.find(f => f.id === activeFeature)?.component}
        </motion.div>
      )}
    </div>
  );
}

// 소그룹 토론방 컴포넌트
function BreakoutRooms({ sessionId }: { sessionId: string }) {
  const [rooms, setRooms] = useState([
    { id: '1', name: '토론방 A', participants: 5, topic: '리더십의 핵심 요소' },
    { id: '2', name: '토론방 B', participants: 4, topic: '팀워크 향상 방안' },
    { id: '3', name: '토론방 C', participants: 6, topic: '혁신적 사고 방법' }
  ]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">소그룹 토론방 관리</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="border rounded-lg p-4">
            <h4 className="font-semibold">{room.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{room.topic}</p>
            <p className="text-sm text-gray-500 mt-2">{room.participants}명 참여 중</p>
            <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
              입장하기
            </button>
          </div>
        ))}
      </div>
      <button className="mt-4 px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50">
        + 새 토론방 만들기
      </button>
    </div>
  );
}

// 실시간 투표 컴포넌트
function LivePolling({ sessionId }: { sessionId: string }) {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });

  // Firebase에서 투표 데이터 실시간 구독
  useEffect(() => {
    const pollsRef = ref(database, `polls/${sessionId}`);
    
    const unsubscribe = onValue(pollsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pollsArray = Object.entries(data).map(([id, poll]: [string, any]) => ({
          id,
          ...poll
        }));
        setPolls(pollsArray);
      } else {
        setPolls([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  // 새 투표 생성
  const createPoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some(opt => !opt.trim())) {
      alert('질문과 모든 선택지를 입력해주세요.');
      return;
    }

    const pollsRef = ref(database, `polls/${sessionId}`);
    const newPollRef = push(pollsRef);
    
    const pollData = {
      question: newPoll.question,
      options: newPoll.options.filter(opt => opt.trim()).map(text => ({
        text: text.trim(),
        votes: 0
      })),
      createdAt: serverTimestamp(),
      active: true
    };

    try {
      await set(newPollRef, pollData);
      setNewPoll({ question: '', options: ['', ''] });
      setShowCreateForm(false);
    } catch (error) {
      console.error('투표 생성 실패:', error);
      alert('투표 생성에 실패했습니다.');
    }
  };

  // 투표하기
  const vote = async (pollId: string, optionIndex: number) => {
    const voteRef = ref(database, `polls/${sessionId}/${pollId}/options/${optionIndex}/votes`);
    const currentPoll = polls.find(p => p.id === pollId);
    
    if (currentPoll) {
      const currentVotes = currentPoll.options[optionIndex].votes || 0;
      try {
        await set(voteRef, currentVotes + 1);
      } catch (error) {
        console.error('투표 실패:', error);
        alert('투표에 실패했습니다.');
      }
    }
  };

  // 선택지 추가
  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  // 선택지 제거
  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  if (loading) {
    return <div className="text-center py-4">투표 정보를 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">실시간 투표</h3>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          {showCreateForm ? '취소' : '새 투표 만들기'}
        </button>
      </div>

      {/* 새 투표 생성 폼 */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <h4 className="font-medium mb-3">새 투표 만들기</h4>
          <input
            type="text"
            placeholder="투표 질문을 입력하세요"
            value={newPoll.question}
            onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
            className="w-full p-2 border rounded mb-3"
          />
          
          <div className="space-y-2 mb-3">
            <label className="text-sm font-medium text-gray-700">선택지:</label>
            {newPoll.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`선택지 ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newPoll.options];
                    newOptions[index] = e.target.value;
                    setNewPoll(prev => ({ ...prev, options: newOptions }));
                  }}
                  className="flex-1 p-2 border rounded"
                />
                {newPoll.options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            {newPoll.options.length < 6 && (
              <button
                onClick={addOption}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                + 선택지 추가
              </button>
            )}
            <button
              onClick={createPoll}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              투표 생성
            </button>
          </div>
        </motion.div>
      )}

      {/* 기존 투표 목록 */}
      {polls.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>아직 진행 중인 투표가 없습니다.</p>
          <p className="text-sm mt-1">첫 번째 투표를 만들어보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map(poll => {
            const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0);
            
            return (
              <div key={poll.id} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">{poll.question}</h4>
                <div className="space-y-3">
                  {poll.options.map((option: any, index: number) => {
                    const votes = option.votes || 0;
                    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span>{option.text}</span>
                          <span className="text-gray-600">
                            {votes}표 ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                              className="bg-green-500 h-3 rounded-full"
                            />
                          </div>
                          <button
                            onClick={() => vote(poll.id, index)}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            투표
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalVotes > 0 && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    총 {totalVotes}명이 투표에 참여했습니다.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 자료 공유 컴포넌트
function ResourceSharing({ sessionId }: { sessionId: string }) {
  const [resources] = useState([
    { id: '1', name: '프로젝트 관리 가이드.pdf', size: '2.5 MB', type: 'pdf' },
    { id: '2', name: '사례 연구 자료.pptx', size: '5.8 MB', type: 'ppt' },
    { id: '3', name: '실습 템플릿.xlsx', size: '1.2 MB', type: 'excel' }
  ]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">공유 자료</h3>
      <div className="space-y-3">
        {resources.map(resource => (
          <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-sm font-medium">
                {resource.type.toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{resource.name}</p>
                <p className="text-sm text-gray-500">{resource.size}</p>
              </div>
            </div>
            <button className="px-3 py-1 text-green-600 hover:bg-green-50 rounded">
              다운로드
            </button>
          </div>
        ))}
      </div>
      <button className="mt-4 px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50">
        + 자료 업로드
      </button>
    </div>
  );
}

// 네트워킹 허브 컴포넌트
function NetworkingHub({ sessionId }: { sessionId: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">네트워킹 허브</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">참여자 프로필</h4>
          <p className="text-sm text-gray-600 mb-3">다른 참여자들과 연결하세요</p>
          <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
            프로필 둘러보기
          </button>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">1:1 미팅 예약</h4>
          <p className="text-sm text-gray-600 mb-3">관심사가 비슷한 참여자와 미팅</p>
          <button className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
            미팅 예약하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 수료증 생성기 컴포넌트
function CertificateGenerator({ sessionId }: { sessionId: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">수료증 발급</h3>
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">🏆</span>
        </div>
        <h4 className="font-semibold mb-2">참여 인증서</h4>
        <p className="text-sm text-gray-600 mb-4">
          세션 참여를 인증하는 공식 수료증을 발급받으세요
        </p>
        <div className="space-y-2">
          <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            수료증 미리보기
          </button>
          <button className="px-6 py-2 border border-green-500 text-green-500 rounded hover:bg-green-50 ml-2">
            PDF 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}