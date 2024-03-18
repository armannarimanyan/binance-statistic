export interface SingleStatisticInterface {
  id: string,
  allValues: Array<SingleBinancePriceForDB>,
  lastResult: LastResultInterface
}
export interface LastResultInterface {
  min: SingleBinancePriceForDB,
  max: SingleBinancePriceForDB
}

export interface SingleBinancePriceForDB{
  price: number
  symbol: string
  time: number
}

export interface ALlValues {
  id: string,
  list: Array<SingleBinancePriceForDB>
}
