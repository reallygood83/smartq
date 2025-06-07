'use client';

import React, { useState } from 'react';
import { useEducationLevel } from '@/contexts/EducationLevelContext';
import { motion } from 'framer-motion';

interface QuestionInputProps {
  onSubmit: (question: string, metadata?: any) => void;
  sessionType?: string;
}

export default function LevelAdaptiveQuestionInput({ onSubmit, sessionType }: QuestionInputProps) {
  const { level, levelConfig } = useEducationLevel();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('general');

  // 레벨별 플레이스홀더
  const placeholders = {
    elementary: '궁금한 게 있어요! 무엇이든 물어보세요 😊',
    middle: '토론하고 싶은 주제나 궁금한 점을 적어주세요',
    high: '깊이 있는 질문이나 토론 주제를 제안해주세요',
    university: '학술적 질문이나 연구 주제를 공유해주세요',
    adult: '실무 관련 질문이나 토론 주제를 입력해주세요'
  };

  // 성인용 카테고리
  const adultCategories = [
    { id: 'general', label: '일반 질문' },
    { id: 'experience', label: '경험 공유' },
    { id: 'challenge', label: '도전 과제' },
    { id: 'solution', label: '해결 방안' },
    { id: 'opinion', label: '의견/제안' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question, {
        category: level === 'adult' ? category : undefined,
        level,
        timestamp: new Date().toISOString()
      });
      setQuestion('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-xl shadow-lg bg-gradient-to-br ${levelConfig.uiTheme.bgGradient}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 레벨별 안내 메시지 */}
        <div className="text-white mb-4">
          <h3 className={`font-bold mb-2 ${
            levelConfig.uiTheme.fontSize === 'large' ? 'text-2xl' : 
            levelConfig.uiTheme.fontSize === 'medium' ? 'text-xl' : 'text-lg'
          }`}>
            {level === 'elementary' ? '🌟 질문을 해보세요!' :
             level === 'middle' ? '💡 생각을 나눠요' :
             level === 'high' ? '🎯 깊이 있는 토론을' :
             level === 'university' ? '🎓 학술적 탐구를' :
             '💼 실무 인사이트를'}
          </h3>
          <p className="opacity-90">
            {level === 'adult' ? 
              `${sessionType === 'workshop' ? '실습 중 궁금한 점이나 아이디어를' :
                sessionType === 'seminar' ? '발표 내용에 대한 질문이나 의견을' :
                '학습 내용과 관련된 질문을'} 자유롭게 공유해주세요` :
              '여러분의 생각을 자유롭게 표현해주세요'
            }
          </p>
        </div>

        {/* 성인용 카테고리 선택 */}
        {level === 'adult' && (
          <div className="bg-white/20 rounded-lg p-3">
            <label className="text-white text-sm mb-2 block">질문 유형</label>
            <div className="flex flex-wrap gap-2">
              {adultCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    category === cat.id
                      ? 'bg-white text-gray-800'
                      : 'bg-white/30 text-white hover:bg-white/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 질문 입력 필드 */}
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={placeholders[level]}
            className={`w-full px-4 py-3 rounded-lg bg-white/90 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              levelConfig.uiTheme.fontSize === 'large' ? 'text-lg' : 
              levelConfig.uiTheme.fontSize === 'medium' ? 'text-base' : 'text-sm'
            }`}
            rows={level === 'elementary' ? 2 : 3}
          />
          
          {/* 초등용 이모지 도우미 */}
          {level === 'elementary' && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {['🤔', '❓', '💭', '✨'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setQuestion(prev => prev + emoji)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!question.trim()}
          className={`w-full py-3 bg-white text-gray-800 rounded-lg font-semibold 
            hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all transform hover:scale-[1.02] active:scale-[0.98]
            ${levelConfig.uiTheme.fontSize === 'large' ? 'text-lg' : 'text-base'}`}
        >
          {level === 'elementary' ? '질문하기! 🚀' :
           level === 'adult' ? '의견 공유하기' :
           '질문 제출하기'}
        </button>

        {/* 성인용 추가 옵션 */}
        {level === 'adult' && (
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>익명으로 제출</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>답변 알림 받기</span>
            </label>
          </div>
        )}
      </form>
    </motion.div>
  );
}