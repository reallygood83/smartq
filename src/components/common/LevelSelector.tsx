'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EducationLevel, AdultLearnerType, EDUCATION_LEVEL_CONFIGS, ADULT_LEARNER_CONFIGS } from '@/types/education'
import { useEducationLevel } from '@/contexts/EducationLevelContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LevelSelectorProps {
  showModal?: boolean
  onClose?: () => void
  allowLevelChange?: boolean
}

export default function LevelSelector({ 
  showModal = false, 
  onClose,
  allowLevelChange = true
}: LevelSelectorProps) {
  const { 
    currentLevel, 
    adultLearnerType, 
    setEducationLevel, 
    setAdultLearnerType 
  } = useEducationLevel()
  
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>(currentLevel)
  const [selectedAdultType, setSelectedAdultType] = useState<AdultLearnerType | undefined>(adultLearnerType)
  const [step, setStep] = useState<'level' | 'adult-type'>('level')

  // 레벨 선택 처리
  const handleLevelSelect = (level: EducationLevel) => {
    setSelectedLevel(level)
    
    if (level === EducationLevel.ADULT) {
      setStep('adult-type')
    } else {
      // 성인이 아닌 경우 바로 적용
      setSelectedAdultType(undefined)
      handleApplySelection(level, undefined)
    }
  }

  // 성인 학습자 타입 선택 처리
  const handleAdultTypeSelect = (type: AdultLearnerType) => {
    setSelectedAdultType(type)
    handleApplySelection(selectedLevel, type)
  }

  // 선택 적용
  const handleApplySelection = (level: EducationLevel, adultType?: AdultLearnerType) => {
    setEducationLevel(level)
    if (adultType) {
      setAdultLearnerType(adultType)
    }
    onClose?.()
  }

  // 레벨 아이콘 반환
  const getLevelIcon = (level: EducationLevel): string => {
    switch (level) {
      case EducationLevel.ELEMENTARY:
        return '🎨'
      case EducationLevel.MIDDLE:
        return '📚'
      case EducationLevel.HIGH:
        return '🎓'
      case EducationLevel.UNIVERSITY:
        return '🏛️'
      case EducationLevel.ADULT:
        return '💼'
      default:
        return '📖'
    }
  }

  // 성인 학습자 타입 아이콘 반환
  const getAdultTypeIcon = (type: AdultLearnerType): string => {
    switch (type) {
      case AdultLearnerType.PROFESSIONAL:
        return '💼'
      case AdultLearnerType.RESKILLING:
        return '🔄'
      case AdultLearnerType.UPSKILLING:
        return '📈'
      case AdultLearnerType.DEGREE_COMPLETION:
        return '🎓'
      case AdultLearnerType.LIFELONG_LEARNING:
        return '🌱'
      default:
        return '📚'
    }
  }

  if (!showModal) {
    // 인라인 레벨 표시 (헤더용)
    return (
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{getLevelIcon(currentLevel)}</span>
        <div>
          <span className="text-sm font-medium">
            {EDUCATION_LEVEL_CONFIGS[currentLevel].displayName}
          </span>
          {adultLearnerType && (
            <div className="text-xs text-gray-500 dark:text-gray-200">
              {ADULT_LEARNER_CONFIGS[adultLearnerType].displayName}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {step === 'level' ? (
              // 교육 레벨 선택 단계
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    교육 레벨을 선택해주세요
                  </h2>
                  <p className="text-gray-600 dark:text-gray-200">
                    사용자에게 맞는 최적화된 경험을 제공해드립니다
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.values(EducationLevel).map((level) => {
                    const config = EDUCATION_LEVEL_CONFIGS[level]
                    const isSelected = selectedLevel === level
                    const isCurrent = currentLevel === level

                    return (
                      <motion.div
                        key={level}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: { 
                            delay: Object.values(EducationLevel).indexOf(level) * 0.1,
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }}
                        whileHover={{ 
                          scale: 1.05, 
                          y: -5,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ 
                          scale: 0.95,
                          transition: { duration: 0.1 }
                        }}
                        className={`cursor-pointer transition-all duration-200 ${
                          !allowLevelChange && !isCurrent ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => allowLevelChange || isCurrent ? handleLevelSelect(level) : undefined}
                      >
                        <Card
                          className={`p-4 h-full border-2 transition-all duration-200 ${
                            isSelected || isCurrent
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: isSelected || isCurrent ? config.theme.backgroundColor : 'white'
                          }}
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3">
                              {getLevelIcon(level)}
                            </div>
                            
                            <h3 className="text-lg font-bold mb-2" style={{ color: config.theme.primaryColor }}>
                              {config.displayName}
                            </h3>
                            
                            <p className="text-xs text-gray-600 dark:text-gray-200 mb-2">
                              {config.ageRange}
                            </p>
                            
                            <p className="text-xs text-gray-700 dark:text-gray-200 mb-3 leading-relaxed">
                              {config.description}
                            </p>
                            
                            <div className="space-y-1">
                              {config.characteristics.slice(0, 2).map((char, index) => (
                                <div 
                                  key={index}
                                  className="text-xs bg-white bg-opacity-70 rounded-full px-2 py-1 inline-block mr-1 mb-1"
                                >
                                  {char}
                                </div>
                              ))}
                              {config.characteristics.length > 2 && (
                                <div className="text-xs text-gray-500 dark:text-gray-200">
                                  +{config.characteristics.length - 2}개 더
                                </div>
                              )}
                            </div>

                            {isCurrent && (
                              <div className="mt-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ 현재
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    취소
                  </Button>
                </div>
              </>
            ) : (
              // 성인 학습자 타입 선택 단계
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    성인 학습자 유형을 선택해주세요
                  </h2>
                  <p className="text-gray-600 dark:text-gray-200">
                    학습 목적에 맞는 맞춤형 기능을 제공해드립니다
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.values(AdultLearnerType).map((type) => {
                    const config = ADULT_LEARNER_CONFIGS[type]
                    const isSelected = selectedAdultType === type
                    const isCurrent = adultLearnerType === type

                    return (
                      <motion.div
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer"
                        onClick={() => handleAdultTypeSelect(type)}
                      >
                        <Card
                          className={`p-6 h-full border-2 transition-all duration-200 ${
                            isSelected || isCurrent
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className="text-4xl">
                              {getAdultTypeIcon(type)}
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-lg font-bold mb-2 text-gray-900">
                                {config.displayName}
                              </h3>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
                                {config.description}
                              </p>
                              
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">주요 영역:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {config.focusAreas.map((area, index) => (
                                      <span 
                                        key={index}
                                        className="text-xs bg-gray-100 rounded px-2 py-1"
                                      >
                                        {area}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-200">
                                  <span>권장 시간: {config.sessionDuration}</span>
                                </div>
                              </div>

                              {isCurrent && (
                                <div className="mt-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✓ 현재 선택됨
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep('level')}
                  >
                    ← 이전
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    취소
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}