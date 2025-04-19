import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SalesFormSchema = z.object({
  isOnSale: z.boolean(),
  discountPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type SalesFormData = z.infer<typeof SalesFormSchema>;

interface SalesFormProps {
  initialData?: {
    isOnSale: boolean;
    discountPercentage?: number;
    startDate?: string;
    endDate?: string;
  };
  onSubmit: (data: SalesFormData) => void;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ initialData }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<SalesFormData>({
    resolver: zodResolver(SalesFormSchema),
    defaultValues: initialData || {
      isOnSale: false, // Corrected property name
      discountPercentage: 0, // Corrected property name
      startDate: '', // Matches schema type
      endDate: '', // Matches schema type
    },
  });

  const isOnSale = watch('isOnSale'); // Fixed property name

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register('isOnSale')}
          className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-gray-800"
        />
        <label className="text-sm text-gray-300">Enable Sale</label>
      </div>

      {isOnSale && (
        <>
          <div>
            <label className="block text-sm text-gray-300">Discount Percentage</label>
            <input
              type="number"
              {...register('discountPercentage', { valueAsNumber: true })}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              min="0"
              max="100"
            />
            {errors.discountPercentage && (
              <p className="text-red-400 text-sm mt-1">{errors.discountPercentage.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300">Start Date</label>
            <input
              type="datetime-local"
              {...register('startDate')}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.startDate && (
              <p className="text-red-400 text-sm mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300">End Date</label>
            <input
              type="datetime-local"
              {...register('endDate')}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.endDate && (
              <p className="text-red-400 text-sm mt-1">{errors.endDate.message}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesForm;
