import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import Chart from 'chart.js/auto'

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent extends BaseComponent implements OnInit {

  chart: Chart | any;
  total_price: any = 0;
  count_user: any;
  count_product: any;
  transaction: any;
  fromDate: any;
  toDate: any;

  ngOnInit(): void {
    this.getListAccount(this.getRequest());
    this.getListOrder(this.getRequestOrder());
    this.productService.getList(this.getRequestProduct()).subscribe(
      (res) => {
        var total = 0;
        this.listProduct = res.data;
        this.listProduct.forEach((x: any) => {
          if (x.price > 0) {
            total = total + x.price;
          }
        })
        this.total_price = total;
      });
    this.createChart(this.getRequestOrder());
  }
  getRequestProduct() {
    return {
      code: this.product_code_search ?? '',
      name: this.product_name_search ?? '',
      categoryId: this.category_search ?? null,
      branchId: this.brand_search ?? null
    }
  }

  getRequestOrder() {
    return {
      code: this.order_code_search ?? '',
      name: this.customer_search ?? '',
      phone: this.phone_search ?? '',
      status: this.status_search ?? null,
      typePayment: this.payment_search ?? null,
      creationTime: this.order_date_search ?? null,
      deletionTime: this.cancle_date_search ?? null
    }
  }
  getRequest() {
    return {
      Username: null,
      Phone: null,
      Name: null,
      Email: null
    }
  }

  exportExcel() {
    this.excelService.exportAsExcelFile(this.listAccount, 'accounts');
  }

  createChart(req: any) {
    this.orderService.getList(req).subscribe(
      (res) => {
        this.chart = new Chart("MyChart", {
          type: 'bar', //this denotes tha type of chart
          data: {// values on X-Axis
            labels: res.data.map((x: any) => x.code),
            datasets: [
              {
                
                label:  `Thành tiền: ${new Intl.NumberFormat('en-VN').format(res.data.reduce((accumulator: any, product: any) => accumulator + product.total, 0))} đ`,
                data: res.data.map((x: any) => x.total),
                backgroundColor: '#1890ff'
              },
            ]
          },
          options: {
            aspectRatio: 2.5
          }
        });
        this.productService.getAllAttribute().subscribe(
          (res) => {
            this.chart = new Chart("MyChart1", {
              type: 'doughnut', //this denotes tha type of chart
              data: {// values on X-Axis
                labels: Array.from(new Set(res.data.map((x: any) => `Size: ${x.sizeName} - Màu: ${x.colorName}`))),
                datasets: [
                  {
                    label: "Thuộc tính",
                    data: [...new Set(res.data.map((x: any) => x.sizeName))],
                    backgroundColor: res.data.map((x: any) => x.colorName)
                  },
                ]
              },
              options: {
                aspectRatio: 2.5
              }
            });
          }
        );
      }
    );
  }

  onChange(result: Date[]): void {
    this.fromDate = new Date(result[0]);
    this.toDate = new Date(result[1]);
  }

  filterChart() {
    this.chart?.destroy();
    let req = {
      from_date: this.fromDate,
      to_date: this.toDate
    }
  }
}
