import type { GoldEditorProps } from '../../types';
import { Card } from './Card';
import { NumberInput } from './NumberInput';
import { useTranslation } from '../../i18n';

export function GoldEditor({
  value,
  onChange,
  min = 0,
  max = 999999,
}: GoldEditorProps) {
  const { t } = useTranslation();
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-amber-400 text-xl">monetization_on</span>
        <span className="text-slate-700 dark:text-slate-200 text-base font-bold">{t('gold.label')}</span>
      </div>
      <NumberInput
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        showMaxButton
      />
    </Card>
  );
}
