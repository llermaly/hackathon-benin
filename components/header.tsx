import ModelStatus from './model-status';

export function Header({ showExtraMessage }: any) {
  return (
    <header className="sticky top-0 z-50 w-full shrink-0 bg-appBlue">
      <div
        className={`mx-auto py-8 px-4 ${showExtraMessage ? 'max-w-7xl' : 'max-w-[1000px]'}`}
      >
        <div className="text-white flex gap-8 flex-wrap lg:flex-nowrap">
          <div className="max-w-sm w-full">
            <h1 className="text-xl font-bold">🇧🇯 FongBot</h1>

            {showExtraMessage && (
              <>
                <h2 className="text-2xl font-semibold max-w-sm mt-3">
                  Welcome to the Interactive Tourism Guide for{' '}
                  <span className="text-appOrange font-bold">Benin!</span>
                </h2>
                <ModelStatus />
              </>
            )}
          </div>
          {showExtraMessage && (
            <div className="bg-appBlue2 text-white rounded-lg p-4">
              This demo showcases an AI-powered assistant that is tailored to{' '}
              <span className="text-appOrange font-semibold">
                help tourists prepare for their journey to Benin,
              </span>{' '}
              immersing them in Fon culture and facilitating communication.
              Built using advanced AI technology,{' '}
              <span className="font-semibold">
                this assistant is a specialist in the Fon culture and provides
                expert translations between English and Fon.
              </span>
              It also creates visual content that enriches the user's
              understanding of Benin.
            </div>
          )}
        </div>
      </div>
      <img src="/lines.svg" alt="lines" className="bg-repeat w-full" />
    </header>
  );
}
