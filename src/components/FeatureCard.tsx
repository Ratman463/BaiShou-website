import type { FC } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * 单个核心特性卡片。
 * - 使用 lucide-react 图标（非 emoji）
 * - 实色半透明背景 + 轻微模糊，非玻璃态
 * - hover 仅提亮边框，不做 scale 变换
 */
const FeatureCard: FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <article
      className="card reveal flex flex-col gap-3 p-6 h-full"
      // 让每张卡片独立淡入，但不设 stagger 延迟（瀑布流被明确禁止）
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: 'rgba(154, 212, 234, 0.12)',
          border: '1px solid rgba(154, 212, 234, 0.22)',
          color: '#9AD4EA',
        }}
        aria-hidden="true"
      >
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <h3 className="text-[17px] font-semibold leading-snug text-white">{title}</h3>
      <p className="text-[14.5px] leading-[1.75] text-[#a0a8b8]">{description}</p>
    </article>
  );
};

export default FeatureCard;