import { useState } from 'react';
import { Radio } from 'antd';
import { useLanguage } from '@repo/i18n';
import { LoginStyle1 } from './LoginStyle1';
import { LoginStyle2 } from './LoginStyle2';

export const Login = () => {
    const [style, setStyle] = useState<'enterprise' | 'minimal'>('enterprise');
    const { currentLanguage, changeLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-layout">
            <div className="flex items-center gap-4 p-4">
                <Radio.Group
                    value={currentLanguage.code}
                    onChange={(e) => changeLanguage(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                    className='flex'
                >
                    <Radio.Button value="vi" className="flex items-center gap-1">
                        🇻🇳 VI
                    </Radio.Button>
                    <Radio.Button value="en" className="flex items-center gap-1">
                        🇺🇸 EN
                    </Radio.Button>
                </Radio.Group>

                <Radio.Group
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    size="small"
                    buttonStyle="solid"
                    className='flex'
                >
                    <Radio.Button value="enterprise" className="flex items-center gap-1">
                        giao diện 1
                    </Radio.Button>
                    <Radio.Button value="minimal" className="flex items-center gap-1">
                        giao diện 2
                    </Radio.Button>
                </Radio.Group>
            </div>

            {style === 'enterprise' ? (
                <LoginStyle1 />
            ) : (
                <LoginStyle2 />
            )}
        </div>
    );
};
