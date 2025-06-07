'use client';

import React, { useState } from 'react';
import { AdultSessionType, ADULT_SESSION_TYPES } from '@/types/education';
import { useEducationLevel } from '@/contexts/EducationLevelContext';

interface AdultSessionFormProps {
  onSubmit: (data: AdultSessionData) => void;
}

interface AdultSessionData {
  title: string;
  type: AdultSessionType;
  description: string;
  objectives: string[];
  targetAudience: string;
  prerequisites: string;
  materials: string[];
  duration: number;
  maxParticipants: number;
}

export default function AdultSessionForm({ onSubmit }: AdultSessionFormProps) {
  const { levelConfig } = useEducationLevel();
  const [formData, setFormData] = useState<AdultSessionData>({
    title: '',
    type: 'seminar',
    description: '',
    objectives: [''],
    targetAudience: '',
    prerequisites: '',
    materials: [''],
    duration: 90,
    maxParticipants: 30
  });

  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6">
      <div className={`p-6 rounded-lg bg-gradient-to-br ${levelConfig.uiTheme.bgGradient} text-white`}>
        <h2 className="text-2xl font-bold mb-2">성인 교육 세션 만들기</h2>
        <p>전문적인 학습 환경을 구성해보세요</p>
      </div>

      {/* 세션 타입 선택 */}
      <div>
        <label className="block text-sm font-medium mb-3">세션 유형</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(ADULT_SESSION_TYPES).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: key as AdultSessionType }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.type === key
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <h4 className="font-semibold">{config.label}</h4>
              <p className="text-xs text-gray-600 mt-1">{config.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                {config.duration} • 최대 {config.maxParticipants}명
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">세션 제목</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="예: 효과적인 프로젝트 관리 실무"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">세션 설명</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            rows={4}
            placeholder="세션의 주요 내용과 진행 방식을 설명해주세요"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">대상 참여자</label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="예: 중간관리자, 프로젝트 매니저, 팀 리더"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">사전 요구사항</label>
          <input
            type="text"
            value={formData.prerequisites}
            onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="예: 기본적인 프로젝트 관리 경험"
          />
        </div>
      </div>

      {/* 학습 목표 */}
      <div>
        <label className="block text-sm font-medium mb-2">학습 목표</label>
        {formData.objectives.map((objective, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={objective}
              onChange={(e) => handleObjectiveChange(index, e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder={`목표 ${index + 1}`}
              required
            />
            {formData.objectives.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveObjective(index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                삭제
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddObjective}
          className="mt-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg"
        >
          + 목표 추가
        </button>
      </div>

      {/* 시간 및 인원 설정 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">진행 시간 (분)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            min={30}
            max={480}
            step={30}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">최대 참여 인원</label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            min={1}
            max={500}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
      >
        세션 생성하기
      </button>
    </form>
  );
}