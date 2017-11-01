window.onload = (function preparePage() {
    let currentOffset = 0;

    Date.prototype.addDays = function(days) {
        let dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        return dat;
    };

    Date.prototype.withoutTime = function () {
        let d = new Date(this);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const api = "c6898c020dd0d3c6977019766daf9eca";
    const url_current = "http://api.openweathermap.org/data/2.5/weather?q={HOLDER}&appid=" + api ;
    const url_forecast = "http://api.openweathermap.org/data/2.5/forecast?q={HOLDER}&appid=" + api;

    let popup = document.querySelector('.widget__popup');
    let widget = document.querySelector('.widget');
    let popupText = document.querySelector('.widget__popup__text');
    let popupCloseBtn = document.querySelector('.widget__popup__img');

    popupCloseBtn.addEventListener('click', function () {
        popup.style.display = 'none';
        widget.classList.remove('widget--dark-bg');
    });

    let btnChosenCity = document.querySelector('.top__btn-chosen-city');
    let inputCity = document.querySelector('.top__input');

    btnChosenCity.addEventListener('click', function () {
        let enteredCity = inputCity.value;
        if (inputCity.value.length !== 0) {
            processData(enteredCity, currentOffset, function (data) {
                render(data);
            });
            inputCity.value = '';
        } else {
            popup.style.display = 'block';
            widget.classList.add('widget--dark-bg');
            popupText.innerHTML = 'You did not enter name of the city';
        }
    });

    processData("Saint-Petersburg", currentOffset, function (data) {
        render(data);
    });
    
    function processData(city, offsetDays, callback) {
        // console.log(city, offsetDays);
        let url = url_forecast.replace("{HOLDER}", city);
        let xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);
// Отсылаем объект в формате JSON и с Content-Type application/json
// Сервер должен уметь такой Content-Type принимать и раскодировать
        xhr.send();
        xhr.onreadystatechange = function() { // (3)
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                popup.style.display = 'block';
                widget.classList.add('widget--dark-bg');
                popupText.innerHTML = 'There is not city with entered name';
            } else {
                let jsonRes = JSON.parse(xhr.responseText);
                if (jsonRes.cod == 200) {
                    //Отфильтрованные значения
                    let needlyDate = new Date();
                    let modifiedDate = needlyDate.addDays(Number(offsetDays));
                    let filteredDates = jsonRes.list.filter(function (item) {
                        let dt = item.dt_txt;
                        //Возмём дату (год-месяц-день)
                        let date = dt.split(' ')[0];
                        let realDate = new Date(date);

                        return modifiedDate.withoutTime().getTime() == realDate.withoutTime().getTime();
                    });

                    // console.log(filteredDates);

                    let locale = "en-us";

                    if (filteredDates.length > 0){
                        //По умолчанию смотрим на первым элемент ИЛИ на день/два вперед
                        let firstDate = filteredDates[Number(offsetDays)];
                        // console.log(firstDate);
                        let ourData = {
                            'cityName': city,
                            'weatherStyle': firstDate.weather[0].main + ", " + firstDate.weather[0].description,
                            'degrees': Math.floor(firstDate.main.temp) - 273,
                            'wind': firstDate.wind.speed,
                            'humidity': firstDate.main.humidity,
                            'clouds': firstDate.clouds.all,
                            'month': modifiedDate.toLocaleString(locale, { month: "short" }),
                            'date': modifiedDate.getDate()
                        };
                        callback(ourData);
                    }
                }
            }
        };
    }

    function render(data) {
        let cityName = document.querySelector('.info__location');
        let weatherStyle = document.querySelector('.info__desc');
        let degrees = document.querySelector('.weather__degrees');
        let wind = document.querySelector('.indicators__wind');
        let humidity = document.querySelector('.indicators__humidity');
        let clouds = document.querySelector('.indicators__clouds');
        let month = document.querySelector('.weather__data__month');
        let date = document.querySelector('.weather__data__day');

        cityName.innerHTML = data.cityName;
        weatherStyle.innerHTML = data.weatherStyle;
        degrees.innerHTML = `${data.degrees}°`;
        wind.innerHTML = `${data.wind} MPH`;
        humidity.innerHTML = `${data.humidity}%`;
        clouds.innerHTML = `${data.clouds}%`;
        month.innerHTML = data.month;
        date.innerHTML = data.date;

        let point = document.querySelector('.points__item');
        let points = document.querySelectorAll('.points__item');

        points.forEach(function (item) {
            item.onclick = function(e) {
                clearClassForPoints();
                e.target.classList.add('active-point');
                currentOffset = e.target.getAttribute("data-offset-days");
                processData(data.cityName, currentOffset, function (data) {
                    render(data);
                });
            }
        });

        function clearClassForPoints() {
            points.forEach(function (item) {
                item.classList.remove('active-point');
            });
        }
    }

    let reloadBtn = document.querySelector('.top__refresh');
    reloadBtn.addEventListener('click', function () {
        let elemDivCity = document.querySelector('.info__location');
        let valOfElemDivCity = elemDivCity.innerHTML;
        if (!valOfElemDivCity || valOfElemDivCity === 'Saint-Petersburg') {
            processData('Saint-Petersburg', currentOffset, function (data) {
                render(data);
            });
        } else {
            processData(valOfElemDivCity, currentOffset, function (data) {
                render(data);
            });
        }
    });

})();