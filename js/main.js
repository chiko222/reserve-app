import { addDays, subDays, format, startOfWeek, isAfter, isEqual, addMonths, intervalToDuration } from 'date-fns'

const today = new Date();
const startDate = startOfWeek(today);
const lastDate = addMonths(today, 2);

let prevCount = 0;
let nextCount = 0;

Vue.createApp({
  data() {
    return {
      dates: [
        {
          dateInfo: startDate,
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          dateNumber: startDate.getDate(),
          day: format(startDate, 'EEE'),
          dayNumber: startDate.getDay(),
          status: []
        }
      ],
      title: format(startDate, 'yyyy-MM'),
      prevDisabled: true,
      nextDisabled: false,
      times: [
        {
          hour: 10,
          min: 0,
          key: 0
        }
      ],
      plan: undefined,
      reserveAction: false,
      reserveData: [
        {
          reserveYear: undefined,
          reserveMonth: undefined,
          reserveDate: undefined,
          reserveTime: undefined,
        }
      ]
    }
  },
  beforeMount() {
    //予約の初期データ作成
    let reserveInfo = JSON.parse(localStorage.getItem('reserveInfo'));
    if (reserveInfo === null) {
      let initReserveDate = addDays(today, 1);
      reserveInfo = {
        reserveInfo0: [initReserveDate.getFullYear(), initReserveDate.getMonth() + 1, initReserveDate.getDate(), '16:00', 0, initReserveDate.getDay(), 12, '1H']
      };
      localStorage.setItem('reserveInfo', JSON.stringify(reserveInfo));
    }
  },
  mounted() {  
    this.getTime;
    this.getCalendar;
    this.checkReserve();
  },
  computed: {
    getTime() {
      //時間軸作成
      for (let i = 0; i < 18; i++) { 
        let hour = this.times[i].hour;
        let min = this.times[i].min;
        let key = this.times[i].key;
        if (i % 2 === 0) {
          this.times.push({
            hour: hour,
            min: min + 30,
            key: key + 1
          })
        } else if (i % 2 === 1) {
          this.times.push({
            hour: hour + 1,
            min: min - 30,
            key: key +  1
          })
        }
      }
      return this.times;      
    },
    getCalendar() {
      //日付軸作成
      this.dates.pop();
      for (let i = 0; i < 7; i++) {
        let date = addDays(startDate, i);
        this.dates.push({
          dateInfo: date,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          dateNumber: date.getDate(),
          day: format(date, 'EEE'),
          dayNumber: date.getDay(),
          status: isAfter(date, today) ? [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
        });
      }
      return this.dates;
    }
  },
  watch: {
    plan(value) {
      this.checkReserve();
    }
  },
  methods: {
    checkReserve() {
      //予約データ取得
      let reserveInfo = JSON.parse(localStorage.getItem('reserveInfo'));
      if (reserveInfo !== null) {
        Object.values(reserveInfo).forEach(value => {
          let reserveWeek = value[4];
          if ((nextCount - prevCount) === reserveWeek) {
            let dayNumber = value[5];
            let timeKey = value[6];
            let plan = value[7];
            this.dates[dayNumber].status[timeKey] = true;
            if (plan === '2H') {
              this.dates[dayNumber].status[timeKey + 1] = true;
            }
            if(this.plan === '2H') {
              this.dates[dayNumber].status[timeKey - 1] = true;
            } else {
              this.dates[dayNumber].status[timeKey - 1] = false;
            }
          }
        })
      }
    },
    getPrevCalendar(event) {
      //カレンダーを進める
      if (event.target.classList.contains('disabled')) {
        event.preventDefault(); 
      } else {
        prevCount++;
        let weekStart = this.dates[0].dateInfo;
        for (let i = 1; i < 8; i++) {
          let date = subDays(weekStart, i);
          this.dates.unshift({
            dateInfo: date,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            dateNumber: date.getDate(),
            day: format(date, 'EEE'),
            dayNumber: date.getDay(),
            status: isAfter(date, today) ? [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
          });
          this.dates.pop();
        }
        this.title = format(this.dates[0].dateInfo, 'yyyy-MM');
        if (!isAfter(this.dates[0].dateInfo, startDate)) {
          this.prevDisabled = true;
        }
        if (!isEqual(this.dates[6].dateInfo, lastDate)) {
          this.nextDisabled = false;
        }
        this.checkReserve();
        return this.dates;
      } 
    },
    getNextCalendar(event) {
      //カレンダーを戻す
      if (event.target.classList.contains('disabled')) {
        event.preventDefault();
      } else {
        nextCount++;
        let weekEnd = this.dates[6].dateInfo;  
        for (let i = 1; i < 8; i++) {
          let date = addDays(weekEnd, i);
          this.dates.push({
            dateInfo: date,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            dateNumber: date.getDate(),
            day: format(date, 'EEE'),
            dayNumber: date.getDay(),
            status: isAfter(date, today) ? [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
            });
          this.dates.shift();
        }
        this.title = format(this.dates[0].dateInfo, 'yyyy-MM');
        if (isAfter(this.dates[6].dateInfo, lastDate)) {
          this.nextDisabled = true;
        }
        if (!isEqual(this.dates[0].dateInfo, startDate)) {
          this.prevDisabled = false;
        }      
        this.checkReserve();
        return this.dates;
      }
    },
    reserve(event) {
      if (event.target.classList.contains('disabled')) {
        event.preventDefault();
      } else {
        if (this.plan === undefined) {
          alert('プランを選択してください');
          event.preventDefault();
        } else {        
          //クリックデータ取得
          this.reserveData = {
            reserveYear: event.target.dataset.year,
            reserveMonth: event.target.dataset.month,
            reserveDate: event.target.dataset.datenumber,
            reserveTime: event.target.dataset.reservetime,
          }       
          let dayNumber = event.target.dataset.daynumber;
          let timeKey = parseInt(event.target.dataset.timekey);
          //今週から何週目かを計算
          let reserve = new Date(this.reserveData.reserveYear, this.reserveData.reserveMonth, this.reserveData.reserveDate);
          let interval = intervalToDuration({
            start: startDate,
            end: reserve
          });
          let reserveWeek = Math.floor(interval.days / 7);
          //予約データをローカルストレージへ追加
          let reserveInfo = JSON.parse(localStorage.getItem('reserveInfo'));
          let reserveLength = Object.keys(reserveInfo).length;
          reserveInfo['reserveInfo' + reserveLength] = ([this.reserveData.reserveYear, this.reserveData.reserveMonth, this.reserveData.reserveDate, this.reserveData.reserveTime, reserveWeek, dayNumber, timeKey,this.plan]);
          localStorage.setItem('reserveInfo', JSON.stringify(reserveInfo));
          //表示を変更
          this.dates[dayNumber].status[timeKey] = true;
          if (this.plan === '2H') {
            this.dates[dayNumber].status[timeKey + 1] = true;
          }
          this.reserveAction = true;
        }
      }
    },
    cancel() {
      //直前の入力データを取得して表示を戻す
      let reserveInfo = JSON.parse(localStorage.getItem('reserveInfo'));
      let reserveInfoLength = Object.keys(reserveInfo).length;
      let lastInfoValue = Object.values(reserveInfo)[reserveInfoLength - 1];
      let dayNumber = lastInfoValue[5];
      let timeKey = lastInfoValue[6];
      this.dates[dayNumber].status[timeKey] = false;
      if (this.plan === '2H') {
        this.dates[dayNumber].status[timeKey + 1] = false;
      }
      //直前の入力データを消去
      delete reserveInfo[Object.keys(reserveInfo)[reserveInfoLength - 1]];
      localStorage.setItem('reserveInfo', JSON.stringify(reserveInfo));
      //htmlを元の状態に戻す
      this.reserveAction = false;
    },
    getReserve() {
      this.reserveAction = false;
    }
  }
}).mount('#calendar');

