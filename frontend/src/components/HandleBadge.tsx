import { useMemo } from 'react';
import { SaleBadge, ComingSoonBadge, SaleEndedBadge } from './BadgeComponent'; // Ensure you import your badge components

interface ProductSaleProps {
  saleStart?: Date | string | number;
  saleEnd?: Date | string | number;
  discount: number;
}

export const ProductSaleStatus = ({ saleStart, saleEnd, discount }: ProductSaleProps) => {
  const now = new Date();
  const startDate = saleStart ? new Date(saleStart) : null;
  const endDate = saleEnd ? new Date(saleEnd) : null;

  // Determine which badge to show
  const saleState = useMemo(() => {
    if (!startDate || isNaN(startDate.getTime())) return null;
    if (!endDate || isNaN(endDate.getTime())) return null;

    if (now < startDate) return 'comingSoon'; // Sale hasn't started yet
    if (now >= startDate && now <= endDate) return 'active'; // Sale is active
    if (now > endDate) return 'ended'; // Sale ended

    return null;
  }, [startDate, endDate, now]);

  return (
    <div>
      {saleState === 'comingSoon' && <ComingSoonBadge date={saleStart} />}
      {saleState === 'active' && <SaleBadge isActive={true} discount={discount} date={saleEnd} />}
      {saleState === 'ended' && <SaleEndedBadge date={saleEnd} />}
    </div>
  );
};
