import { Switch } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '.';

export function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="flex items-center gap-2">
            <SunOutlined className={!isDark ? 'text-yellow-500' : 'text-gray-400'} />
            <Switch
                checked={isDark}
                onChange={toggleTheme}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
            />
            <MoonOutlined className={isDark ? 'text-blue-400' : 'text-gray-400'} />
        </div>
    );
}

