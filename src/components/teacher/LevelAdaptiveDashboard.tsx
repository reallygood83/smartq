'use client';

import React from 'react';
import { useEducationLevel } from '@/contexts/EducationLevelContext';
import { getTerminology } from '@/lib/aiPrompts';
import { motion } from 'framer-motion';

interface DashboardProps {
  sessions: any[];
  onCreateSession: () => void;
  onEditSession: (session: any) => void;
}

export default function LevelAdaptiveDashboard({ sessions, onCreateSession, onEditSession }: DashboardProps) {
  const { level, levelConfig } = useEducationLevel();

  // 레벨별 대시보드 스타일
  const dashboardStyles = {
    elementary: {
      cardClass: 'bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-purple-200',
      buttonClass: 'bg-pink-500 hover:bg-pink-600 text-white',
      statClass: 'bg-yellow-100 text-yellow-800'
    },
    middle: {
      cardClass: 'bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200',
      buttonClass: 'bg-teal-500 hover:bg-teal-600 text-white',
      statClass: 'bg-blue-100 text-blue-800'
    },
    high: {
      cardClass: 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200',
      buttonClass: 'bg-indigo-500 hover:bg-indigo-600 text-white',
      statClass: 'bg-purple-100 text-purple-800'
    },
    university: {
      cardClass: 'bg-gray-50 border border-gray-300',
      buttonClass: 'bg-gray-700 hover:bg-gray-800 text-white',
      statClass: 'bg-gray-200 text-gray-800'
    },
    adult: {
      cardClass: 'bg-gradient-to-br from-green-50 to-blue-50 border border-green-200',
      buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
      statClass: 'bg-green-100 text-green-800'
    }
  };

  const style = dashboardStyles[level];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className={`p-6 rounded-xl bg-gradient-to-br ${levelConfig.uiTheme.bgGradient} text-white`}>
        <h1 className="text-3xl font-bold mb-2">
          {getTerminology('teacher', level)} 대시보드
        </h1>
        <p className="opacity-90">
          {level === 'adult' ? '교육 세션을 관리하고 참여자들의 학습을 지원하세요' :
           `${getTerminology('class', level)}를 관리하고 ${getTerminology('student', level)}들의 활동을 확인하세요`}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-lg ${style.statClass}`}
        >
          <h3 className="text-sm font-medium opacity-80">
            전체 {getTerminology('class', level)}
          </h3>
          <p className="text-2xl font-bold">{sessions.length}</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-lg ${style.statClass}`}
        >
          <h3 className="text-sm font-medium opacity-80">
            활성 {getTerminology('student', level)}
          </h3>
          <p className="text-2xl font-bold">
            {sessions.reduce((sum, s) => sum + (s.activeParticipants || 0), 0)}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-lg ${style.statClass}`}
        >
          <h3 className="text-sm font-medium opacity-80">총 질문</h3>
          <p className="text-2xl font-bold">
            {sessions.reduce((sum, s) => sum + (s.questionCount || 0), 0)}
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-4 rounded-lg ${style.statClass}`}
        >
          <h3 className="text-sm font-medium opacity-80">
            {level === 'adult' ? '평균 참여율' : '평균 참여도'}
          </h3>
          <p className="text-2xl font-bold">85%</p>
        </motion.div>
      </div>

      {/* 세션 생성 버튼 */}
      <button
        onClick={onCreateSession}
        className={`w-full py-4 rounded-lg font-semibold ${style.buttonClass} 
          transform transition-all hover:scale-[1.02] active:scale-[0.98]`}
      >
        {level === 'elementary' && '🎈 '}
        {level === 'adult' ? '새 교육 세션 만들기' : `새 ${getTerminology('class', level)} 만들기`}
        {level === 'elementary' && ' 🎈'}
      </button>

      {/* 세션 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {level === 'adult' ? '진행 중인 세션' : `내 ${getTerminology('class', level)} 목록`}
        </h2>
        
        {sessions.map((session) => (
          <motion.div
            key={session.id}
            whileHover={{ x: 5 }}
            className={`p-6 rounded-lg ${style.cardClass} cursor-pointer`}
            onClick={() => onEditSession(session)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{session.title}</h3>
                <p className="text-sm opacity-80 mb-3">{session.description}</p>
                
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    {level === 'elementary' ? '👦' : '👤'} 
                    {session.participantCount || 0} {getTerminology('student', level)}
                  </span>
                  <span className="flex items-center gap-1">
                    {level === 'elementary' ? '❓' : '💬'} 
                    {session.questionCount || 0} 질문
                  </span>
                  {level === 'adult' && session.sessionType && (
                    <span className="flex items-center gap-1">
                      📋 {session.sessionType}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium mb-1">세션 코드</p>
                <p className="text-2xl font-bold font-mono">{session.code}</p>
              </div>
            </div>
            
            {/* 성인용 추가 정보 */}
            {level === 'adult' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>진행 시간: {session.duration || 90}분</span>
                  <span>최대 인원: {session.maxParticipants || 30}명</span>
                  <span>진행률: {session.progress || 0}%</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 레벨별 추가 기능 */}
      {level === 'elementary' && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 선생님 팁!</h3>
          <p className="text-sm text-yellow-700">
            학생들이 자유롭게 질문할 수 있도록 격려해주세요. 모든 질문은 소중합니다!
          </p>
        </div>
      )}
      
      {level === 'adult' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <h3 className="font-semibold mb-1">📊 세션 분석</h3>
            <p className="text-sm text-gray-600">참여도와 학습 효과 분석</p>
          </button>
          <button className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <h3 className="font-semibold mb-1">📧 참여자 관리</h3>
            <p className="text-sm text-gray-600">초대 및 커뮤니케이션</p>
          </button>
          <button className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <h3 className="font-semibold mb-1">🎯 학습 목표</h3>
            <p className="text-sm text-gray-600">목표 설정 및 추적</p>
          </button>
        </div>
      )}
    </div>
  );
}