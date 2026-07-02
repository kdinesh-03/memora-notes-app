import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Rect,
    Stop,
} from 'react-native-svg';
import { useColors } from '@/shared/theme/colors';

export const CaptureNotesIllustration = () => {
    const colors = useColors();
    return (
        <Svg width="220" height="220" viewBox="0 0 200 200">
            <Defs>
                <LinearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#007AFF" />
                    <Stop offset="100%" stopColor="#00C6FF" />
                </LinearGradient>
                <LinearGradient id="penGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FF9500" />
                    <Stop offset="100%" stopColor="#FF5E36" />
                </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="80" fill="url(#bgGrad1)" opacity="0.12" />
            <Circle cx="150" cy="50" r="10" fill="url(#bgGrad1)" opacity="0.08" />
            <Circle cx="50" cy="160" r="15" fill="url(#bgGrad1)" opacity="0.08" />

            <Rect
                x="45" y="40" width="110" height="130" rx="14"
                fill={colors.cardBackground} stroke={colors.border} strokeWidth="2"
            />

            <Rect x="60" y="58" width="55" height="7" rx="3.5" fill={colors.accent} />
            <Rect x="60" y="80" width="80" height="4" rx="2" fill={colors.textSecondary} opacity="0.5" />
            <Rect x="60" y="92" width="70" height="4" rx="2" fill={colors.textSecondary} opacity="0.5" />

            <Rect x="60" y="112" width="14" height="14" rx="4" fill="#30D158" />
            <Path
                d="M64 119 L67 122 L71 115"
                stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
            />
            <Rect x="82" y="117" width="55" height="4" rx="2" fill={colors.text} />

            <Rect x="60" y="134" width="14" height="14" rx="4"
                fill="none" stroke={colors.borderDark} strokeWidth="2"
            />
            <Rect x="82" y="139" width="45" height="4" rx="2" fill={colors.textSecondary} opacity="0.5" />

            <Path
                d="M135 65 L165 35 C170 30 178 30 183 35 C188 40 188 48 183 53 L153 83 Z"
                fill="url(#penGrad)"
            />
            <Path d="M135 65 L133 75 L143 73 Z" fill={colors.text} />
            <Path d="M148 52 L158 62" stroke="#FFF" strokeWidth="2" />
        </Svg>
    );
};

export const RemindersIllustration = () => {
    const colors = useColors();
    return (
        <Svg width="220" height="220" viewBox="0 0 200 200">
            <Defs>
                <LinearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FF9500" />
                    <Stop offset="100%" stopColor="#FFCC00" />
                </LinearGradient>
                <LinearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FF9F0A" />
                    <Stop offset="100%" stopColor="#FFD60A" />
                </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="80" fill="url(#bgGrad2)" opacity="0.12" />
            <Circle cx="40" cy="50" r="12" fill="url(#bgGrad2)" opacity="0.08" />

            <Rect x="45" y="55" width="110" height="100" rx="14"
                fill={colors.cardBackground} stroke={colors.border} strokeWidth="2"
            />
            <Path
                d="M45 69 C45 61 51 55 59 55 H141 C149 55 155 61 155 69 V75 H45 Z"
                fill={colors.accent}
            />
            <Rect x="65" y="47" width="8" height="14" rx="4" fill={colors.borderDark} />
            <Rect x="127" y="47" width="8" height="14" rx="4" fill={colors.borderDark} />

            <Circle cx="65" cy="95" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="85" cy="95" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="105" cy="95" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="125" cy="95" r="5" fill={colors.textSecondary} opacity="0.25" />

            <Circle cx="65" cy="115" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="85" cy="115" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="105" cy="115" r="5" fill={colors.accent} />
            <Circle cx="125" cy="115" r="5" fill={colors.textSecondary} opacity="0.25" />

            <Circle cx="65" cy="135" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="85" cy="135" r="5" fill={colors.textSecondary} opacity="0.25" />
            <Circle cx="105" cy="135" r="5" fill={colors.textSecondary} opacity="0.25" />

            <Circle cx="145" cy="135" r="35" fill={colors.cardBackground} />
            <Circle cx="145" cy="135" r="35" fill="url(#bellGrad)" opacity="0.15" />

            <Path
                d="M145 112 C137 112 133 118 133 125 V138 H157 V125 C157 118 153 112 145 112 Z"
                fill="url(#bellGrad)"
            />
            <Path d="M141 143 C141 146 143 148 145 148 C147 148 149 146 149 143 Z" fill="url(#bellGrad)" />
            <Rect x="129" y="138" width="32" height="4" rx="2" fill="url(#bellGrad)" />
            <Circle cx="145" cy="110" r="3" fill="none" stroke="#FF9F0A" strokeWidth="2" />
        </Svg>
    );
};

export const SyncSecureIllustration = () => {
    const colors = useColors();
    return (
        <Svg width="220" height="220" viewBox="0 0 200 200">
            <Defs>
                <LinearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#30D158" />
                    <Stop offset="100%" stopColor="#00E676" />
                </LinearGradient>
                <LinearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#30D158" />
                    <Stop offset="100%" stopColor="#1B5E20" />
                </LinearGradient>
                <LinearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#007AFF" />
                    <Stop offset="100%" stopColor="#007AFF80" />
                </LinearGradient>
            </Defs>
            <Circle cx="100" cy="100" r="80" fill="url(#bgGrad3)" opacity="0.1" />

            <Path
                d="M100 45 C115 45 125 53 128 65 C132 63 136 62 140 62 C154 62 165 73 165 87 C165 101 154 112 140 112 H70 C56 112 45 101 45 87 C45 74 55 64 68 62.5 C72 52 85 45 100 45 Z"
                fill="none" stroke={colors.accent} strokeWidth="2.5" strokeDasharray="4 4" opacity="0.6"
            />

            <Circle cx="70" cy="55" r="3" fill={colors.accent} opacity="0.5" />
            <Circle cx="135" cy="50" r="2.5" fill={colors.accent} opacity="0.5" />

            <Path
                d="M100 70 L145 85 V125 C145 152 125 167 100 175 C75 167 55 152 55 125 V85 Z"
                fill={colors.cardBackground} stroke={colors.border} strokeWidth="2"
            />
            <Path
                d="M100 75 L138 88 V122 C138 145 121 158 100 165 V75 Z"
                fill="url(#shieldGrad)" opacity="0.15"
            />

            <Path
                d="M87 118 V110 C87 103 93 97 100 97 C107 97 113 103 113 110 V118"
                fill="none" stroke={colors.accent} strokeWidth="3.5" strokeLinecap="round"
            />
            <Rect x="78" y="118" width="44" height="32" rx="8" fill={colors.accent} />
            <Circle cx="100" cy="130" r="3" fill={colors.cardBackground} />
            <Rect x="98.5" y="132" width="3" height="8" rx="1.5" fill={colors.cardBackground} />
        </Svg>
    );
};
