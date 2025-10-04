type Props = {
    text: string
}

export function Message({ text }: Props) {

    return (
        <div className="text-5xl font-bold absolute bottom-0 z-10 flex items-center p-8 justify-center w-full bg-white">
            {text.toUpperCase()}
        </div>
    )
}
