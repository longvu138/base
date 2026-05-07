import { useProfileQuery } from '@repo/hooks';
import { DynamicVariant } from '@repo/ui';
import { useVariant } from '@repo/theme-provider';

const modules = import.meta.glob('./*.tsx');

const ProfilePage = () => {
    const variant = useVariant('profile');
    const { data: profile, isLoading } = useProfileQuery();

    return (
        <div className="bg-layout min-h-screen pb-20">
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold mb-0">Hồ sơ cá nhân</h1>
                    <span className="text-[10px] text-gray-400 italic">
                        Variant: <strong className="text-primary">{variant}</strong>
                    </span>
                </div>

                <DynamicVariant
                    variantName={variant}
                    modules={modules}
                    fallbackName="ProfileStyle1"
                    featureName="Profile"
                    componentProps={{
                        profile,
                        isLoading
                    }}
                />
            </div>
        </div>
    );
};

export default ProfilePage;
