'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { EscrowStatus as EscrowStatusType } from '@/types/database';
import { Shield, Lock, Unlock, RotateCcw, Timer, Sparkles } from 'lucide-react';

interface IEscrowVisualProps {
  status: EscrowStatusType;
  amount: string | number;
  cryptocurrency: string;
  releasedAt?: Date | string | null;
  countdown?: number; // seconds until auto-release
  className?: string;
  onRelease?: () => void;
  onRefund?: () => void;
}

export function EscrowVisual({
  status,
  amount,
  cryptocurrency,
  releasedAt,
  countdown,
  className,
  onRelease,
  onRefund
}: IEscrowVisualProps) {
  const [timeLeft, setTimeLeft] = useState(countdown || 0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (countdown && status === 'LOCKED') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown, status]);

  useEffect(() => {
    if (status === 'RELEASED') {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 3000);
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVaultAnimation = () => {
    switch (status) {
      case 'LOCKED':
        return {
          rotate: [0, -5, 5, -5, 0],
          scale: [1, 1.02, 1, 1.02, 1],
        };
      case 'RELEASED':
        return {
          rotate: [0, -10, 10, -10, 0, 360],
          scale: [1, 1.1, 1.2, 1.1, 1],
        };
      case 'REFUNDED':
        return {
          rotate: [0, -180, -360],
          scale: [1, 0.9, 1],
        };
      default:
        return {};
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'LOCKED':
        return {
          title: 'Fundos em Custódia Segura',
          description: 'Os fundos estão protegidos até a confirmação',
          bgGradient: 'from-blue-500 to-indigo-600',
          glowColor: 'blue',
          icon: Lock,
        };
      case 'RELEASED':
        return {
          title: 'Fundos Liberados com Sucesso',
          description: releasedAt
            ? `Liberado em ${new Date(releasedAt).toLocaleString('pt-BR')}`
            : 'Transação concluída com segurança',
          bgGradient: 'from-green-500 to-emerald-600',
          glowColor: 'green',
          icon: Unlock,
        };
      case 'REFUNDED':
        return {
          title: 'Fundos Reembolsados',
          description: 'Os fundos retornaram ao vendedor',
          bgGradient: 'from-gray-500 to-gray-600',
          glowColor: 'gray',
          icon: RotateCcw,
        };
      default:
        return {
          title: 'Status do Escrow',
          description: '',
          bgGradient: 'from-gray-500 to-gray-600',
          glowColor: 'gray',
          icon: Shield,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-gray-50 to-gray-100',
        'border border-gray-200 shadow-2xl',
        className
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.5) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8">
        {/* Vault Container */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="relative"
            animate={getVaultAnimation()}
            transition={{
              duration: status === 'RELEASED' ? 1.5 : 2,
              repeat: status === 'LOCKED' ? Infinity : 0,
              repeatType: 'reverse',
            }}
          >
            {/* Glow Effect */}
            <motion.div
              className={cn(
                'absolute inset-0 rounded-full blur-2xl',
                `bg-${config.glowColor}-400 opacity-50`
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Vault Icon */}
            <div
              className={cn(
                'relative w-32 h-32 rounded-full',
                'bg-gradient-to-br',
                config.bgGradient,
                'shadow-2xl flex items-center justify-center'
              )}
            >
              <Icon className="w-16 h-16 text-white" />
              
              {/* Progress Ring */}
              {status === 'LOCKED' && countdown && (
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="60"
                    stroke="rgba(255, 255, 255, 0.8)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={377}
                    initial={{ strokeDashoffset: 0 }}
                    animate={{
                      strokeDashoffset: 377 - (377 * timeLeft) / (countdown || 1),
                    }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </svg>
              )}
            </div>

            {/* Floating Particles */}
            <AnimatePresence>
              {showParticles && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                      animate={{
                        x: Math.random() * 200 - 100,
                        y: Math.random() * -200 - 50,
                        opacity: 0,
                        scale: [0, 1.5, 0],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, delay: i * 0.1 }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Status Info */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h3>
          <p className="text-gray-600">{config.description}</p>
        </div>

        {/* Amount Display */}
        <motion.div
          className="bg-white rounded-xl p-6 shadow-inner mb-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Valor em Custódia</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              {amount} {cryptocurrency}
            </p>
          </div>
        </motion.div>

        {/* Timer Display */}
        {status === 'LOCKED' && countdown && timeLeft > 0 && (
          <motion.div
            className="bg-blue-50 rounded-lg p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3">
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Liberação automática em
                </p>
                <p className="text-2xl font-bold text-blue-700">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {status === 'LOCKED' && (onRelease || onRefund) && (
          <div className="flex gap-3">
            {onRelease && (
              <motion.button
                onClick={onRelease}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Unlock className="w-5 h-5 inline mr-2" />
                Liberar Fundos
              </motion.button>
            )}
            {onRefund && (
              <motion.button
                onClick={onRefund}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Reembolsar
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}