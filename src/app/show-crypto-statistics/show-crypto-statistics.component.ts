import {Component, OnInit} from '@angular/core';
import {BinanceApiService} from "../services/binance-api.service";
import {DbRequestsService} from "../services/db-requests.service";
import {BinanceTickerPriceInterface} from "../interfaces/binance-ticker-price.interface";
import {ALlValues, SingleBinancePriceForDB, SingleStatisticInterface} from "../interfaces/statistic.interface";

@Component({
  selector: 'app-show-crypto-statistics',
  templateUrl: './show-crypto-statistics.component.html',
  styleUrls: ['./show-crypto-statistics.component.scss']
})
export class ShowCryptoStatisticsComponent implements OnInit{

  interval!: ReturnType<typeof setInterval>;
  data: Array<SingleStatisticInterface> = [];
  allValues!: ALlValues;
  future = 'BTCUSDT';

  constructor(
    private binanceApi: BinanceApiService,
    private dbRequest: DbRequestsService
  ) {}

  ngOnInit(): void {
    // Start of db statistic base model get
    this.dbRequest.get('statistic').subscribe((res: Array<SingleStatisticInterface>) => {
      this.data = res;
    });
    // end of db statistic get

    // Start of db all values get
    this.dbRequest.get('allValues/lastValues').subscribe((res: ALlValues) => {
      this.allValues = res;
    })
    // end of db all values get

    // set interval for getting to 5 second data from binance and save in db
    this.interval = setInterval(() => {
      this.getLastStatisticAndSave();
    },5000)
  }

  getLastStatisticAndSave(): void {
    this.binanceApi.getBasisData(this.future).subscribe((cryptoInfo: BinanceTickerPriceInterface) => { //Binance data get
      this.allValues?.list.push({...cryptoInfo,price: +cryptoInfo.price});
      this.dbRequest.put('allValues','lastValues', {list: this.allValues.list}).subscribe(() => { // Adding data to db
        this.detectAndCalculateStatistics()
      })
    })
  }

  deleteLastStatistic(): void {
    this.allValues.list = [];
    this.dbRequest.put('allValues','lastValues', {list: this.allValues.list}).subscribe()
  }

  detectAndCalculateStatistics(): void { // this function for detect 5m, 15m, 1h, 4h and 24h datas
    this.detectFiveMinuteStatistic(); //5m,
    this.detectFifteenStatistic(); //15m,
    this.detectHourStatistic(); //1h,
    this.detectFourHourStatistic(); //4h,
    this.detectTwentyFourStatistic(); //24h
  }

  detectFiveMinuteStatistic(): void {
    if (this.allValues.list.length === 60) {
      //  i have an array , all values i am pushing to that array,
      // when that array length is 60 i am refreshing 5m data
      let prices = this.allValues.list.map((obj: SingleBinancePriceForDB) => obj.price);
      let min = this.allValues.list.find((item: SingleBinancePriceForDB) => item.price === Math.min(...prices));
      let max = this.allValues.list.find((item: SingleBinancePriceForDB) => item.price === Math.max(...prices));
      const fiveMinuteData = this.data.find((item: SingleStatisticInterface) => item.id === '5m');
      if (!fiveMinuteData || !max || !min) { return}
      fiveMinuteData.allValues.push(min, max);
      fiveMinuteData.lastResult = ({min, max});
      this.putNewData('5m', fiveMinuteData);
      this.deleteLastStatistic();
    }
  }

  detectFifteenStatistic(): void {
    const fiveMinuteData = this.data.find((item: SingleStatisticInterface) => item.id === '5m');
    if (!fiveMinuteData) { return;}
    if ((fiveMinuteData.allValues.length / 2) === 3) {
      // when that array length is 6 I am refreshing 15m data
      const fifteenMinuteData = this.data.find((item: SingleStatisticInterface) => item.id === '15m');
      this.setNewData({key: '5m',data: fiveMinuteData},{key: '15m', data: fifteenMinuteData})

    }
  }

  detectHourStatistic(): void {
    const fifteenMinuteData = this.data.find((item: SingleStatisticInterface) => item.id === '15m');
    if (!fifteenMinuteData) { return;}
    if ((fifteenMinuteData.allValues.length / 2) === 4) {
      // when that array length is 8 I am refreshing 1h data
      const hourData = this.data.find((item: SingleStatisticInterface) => item.id === '1h');
      this.setNewData({key: '15m',data: fifteenMinuteData},{key: '1h', data: hourData})

    }
  }

  detectFourHourStatistic(): void {
    const hourData = this.data.find((item: SingleStatisticInterface) => item.id === '1h');
    if (!hourData) { return;}
    if ((hourData.allValues.length / 2) === 4) {
      // when that array length is 8 I am refreshing 4h data
      const fourHourData = this.data.find((item: SingleStatisticInterface) => item.id === '4h');
      this.setNewData({key: '1h',data: hourData},{key: '4h', data: fourHourData})
    }
  }

  detectTwentyFourStatistic(): void {
    const fourHourData = this.data.find((item: SingleStatisticInterface) => item.id === '4h');
    if (!fourHourData) { return;}
    if ((fourHourData.allValues.length / 2) === 6) {
      // when that array length is 14 I am refreshing 24h data
      const twentyFourHourData = this.data.find((item: SingleStatisticInterface) => item.id === '24h');
      this.setNewData({key: '4h',data: fourHourData},{key: '24h', data: twentyFourHourData})
    }
  }

  // this function getting min and max from arrays , for 15m, 1h, 4h , and 24h,
  // this is global function
  setNewData(previewData: {key: string, data: SingleStatisticInterface}, currentData: { key: string, data: SingleStatisticInterface | undefined }): void {
    if (!previewData?.data || !currentData.data) { return;}
    let prices = previewData.data.allValues.map((obj: any) => obj.price);

    let min = previewData.data.allValues.find((item: any) => item.price === Math.min(...prices));
    let max = previewData.data.allValues.find((item: any) => item.price === Math.max(...prices));
    if (!min || !max) { return;}
    if (currentData.key !== '24h') {
      currentData.data.allValues.push(min, max);
    }
    currentData.data.lastResult = ({min, max});
    previewData.data.allValues = [];
    this.putNewData(previewData.key, previewData.data);
    this.putNewData(currentData.key, currentData.data);
  }

  // Sending new data to db
  putNewData(postId: string,postData: SingleStatisticInterface ): void {
    this.dbRequest.put('statistic',postId,postData).subscribe();
  }

}
