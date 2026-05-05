import { useStore } from "@/hooks/useStore";
import ArticlesButton from "./Button"

export default function DebugPanel() {

    const debugMode = useStore(state => state.debug);
    const setDebugMode = useStore(state => state.setDebug);
    const reloadScene = useStore(state => state.reloadScene);

    return (
        <div
            className="card card-articles card-sm"
        >
            <div className="card-body">

                <div className="small text-muted">Debug Controls</div>

                <div className="small border p-2">
                    {/* <div>Rotation Angle: {hitRotation}</div> */}
                    {/* <div>Power: {hitPower}/100</div> */}
                </div>

                <div className='d-flex flex-column'>

                    <div>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => reloadScene()}
                        >
                            <i className="fad fa-redo"></i>
                            Reload Game
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            onClick={() => reloadScene()}
                        >
                            <i className="fad fa-redo"></i>
                            Reset Camera
                        </ArticlesButton>

                        <ArticlesButton
                            size="sm"
                            className="w-50"
                            active={debugMode}
                            onClick={() => {
                                setDebugMode(!debugMode)
                            }}
                        >
                            <i className="fad fa-code"></i>
                            Debug Mode
                        </ArticlesButton>

                    </div>

                </div>

            </div>
        </div>
    )

}