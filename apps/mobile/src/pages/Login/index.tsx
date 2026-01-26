import { useState } from 'react';
import { Radio } from 'antd';
import { useLanguage } from '@repo/i18n';
import { LoginStyle1 } from './LoginStyle1';
import { LoginStyle2 } from './LoginStyle2';
import { ThemeSwitcher } from '@repo/theme-provider';

export const Login = () => {
    const { currentLanguage, changeLanguage } = useLanguage();
    const [style, setStyle] = useState<'style1' | 'style2'>('style1');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50 relative overflow-hidden">
            {/* Background elements for visual flair */}
            <div className="absolute -top-24 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Radio.Group
                        value={currentLanguage.code}
                        onChange={(e) => changeLanguage(e.target.value)}
                        size="small"
                        buttonStyle="solid"
                    >
                        <Radio.Button value="vi">VI</Radio.Button>
                        <Radio.Button value="en">EN</Radio.Button>
                    </Radio.Group>
                    <div className="scale-90 opacity-80">
                        <ThemeSwitcher />
                    </div>
                </div>

                <Radio.Group
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                >
                    <Radio.Button value="style1">
                        Giao diện 1
                    </Radio.Button>
                    <Radio.Button value="style2">
                        Giao diện 2
                    </Radio.Button>
                </Radio.Group>
            </div>

            <div className="flex-1 flex flex-col justify-center px-6 pb-12 z-10">
                {style === 'style1' ? (
                    <LoginStyle1 />
                ) : (
                    <LoginStyle2 />
                )}
            </div>
        </div>
    );
};

export default Login;
