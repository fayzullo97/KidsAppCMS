import { Suspense } from 'react';
import UnitForm from '@/components/units/UnitForm';

export default function NewUnitPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Create New Unit</h1>
            <Suspense fallback={<div>Loading...</div>}>
                <UnitForm />
            </Suspense>
        </div>
    );
}
