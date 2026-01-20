import { useStore } from "@/hooks/useStore"
import ArticlesButton from "./Button"

export default function ScoreCard({ score }) {

    const maxDistanceTraveled = useStore((state) => state.maxDistanceTraveled)
    const setMaxDistanceTraveled = useStore((state) => state.setMaxDistanceTraveled)

    return (
        <div
            className="card card-articles card-sm"            
        >

            {/* <div style={{ position: 'relative', height: '200px' }}>
                        <Image
                            src={Logo}ddda
                            alt=""
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div> */}

            <div className='card-header flex-header'>

                <div>High Score</div>

                <ArticlesButton
                    className=''
                    small
                    onClick={() => {
                        setMaxDistanceTraveled(0)
                    }}
                >
                    <i className="fad fa-redo"></i>
                </ArticlesButton>

            </div>

            <div className="card-body">

                {maxDistanceTraveled}

            </div>

            {/* <div className="card-footer d-flex flex-wrap justify-content-center">

            </div> */}

        </div>
    )
}