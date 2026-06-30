import type { FC } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <article className="card reveal flex h-full flex-col gap-3 p-6">
      <div className="feature-icon" aria-hidden="true">
        <Icon size={24} strokeWidth={1.8} />
      </div>
      <h3
        className="text-[17px] font-semibold leading-snug"
        style={{ color: 'var(--text-heading)' }}
      >
        {title}
      </h3>
      <p
        className="text-[14.5px] leading-[1.75]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
    </article>
  );
};

export default FeatureCard;
