import { useStore } from '@/hooks/useStore';
import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function LandingBackgroundAnimation() {

    const sceneKey = useStore(state => state.sceneKey);

    return (
        <GameCanvas
            key={sceneKey}
            landingAnimationMode={true}
        />
    )
}