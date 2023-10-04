import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrls: ['./sale.component.scss']
})
export class SaleComponent extends BaseComponent implements OnInit {

  AddForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    value: new FormControl(null, [Validators.required]),
    effectiveDate: new FormControl(null, [Validators.required]),
    expiredDate: new FormControl(null, [Validators.required]),
    status: new FormControl(1),
  })

  code: any;
  effectiveDate: any;
  expiredDate: any;
  isDisplaySale: boolean = false;
  saleId: any;
  detailId: any;
  checked: any
   
  valueType: any = [
    {id: "1", name: "Phần trăm"},
    {id: "0", name: "Giá tiền"},
  ]
  ngOnInit(): void {
    this.getListSale(this.getRequest());
  }

  getRequest() {
   return {
    code: this.code ?? '',
    effectiveDate: this.effectiveDate ?? null,
    expiredDate: this.expiredDate ?? null
   }
   
  }

  showConfirm(id: any): void {
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn xóa khuyến mại này không?</i>',
      nzOnOk: () => {
        this.saleService.delete(id).subscribe(
          (res) => {
            if (res) {
              this.toastr.success('Xóa thành công !');
              this.getListSale(this.getRequest());
            }
            else {
              this.toastr.warning('Xóa thất bại !');
              this.getListSale(this.getRequest());
            }
          }
        )
      }
    });
  }

  showAddModal(dataEdit: any): void {
    this.isDisplay = true;
    this.titleModal = !dataEdit ? 'Thêm mới' : 'Cập nhật';
    this.selected_ID = 0;
    if (dataEdit != null) {
      this.selected_ID = dataEdit.id;
      this.AddForm.patchValue({
        code: !dataEdit ? '' : dataEdit.code,
        name: !dataEdit ? '' : dataEdit.name,
        value: !dataEdit ? '' : dataEdit.value,
        effectiveDate: !dataEdit ? '' : dataEdit.effectiveDate,
        expiredDate: !dataEdit ? '' : dataEdit.expiredDate,
        status: !dataEdit ? 1 : dataEdit.status,
      });
    }
    else {
      this.AddForm.reset();
      this.AddForm.patchValue({
        status: 1,
        code: 'SA_' + this.makeRandomeCode(6),
      });
    }
  }

  handleOk(): void {
    const startDate = this.AddForm.value?.effectiveDate;
    const endDate = this.AddForm.value?.expiredDate;

    if(startDate && endDate && startDate >= endDate){
      this.toastr.warning('Ngày bắt đầu không được lơn hơn hoặc bằng ngày kết thúc !');
      return;
    }

    if(startDate && new Date(startDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)){
      this.toastr.warning('Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại !');
      return;
    }

    // if(this.AddForm.value.value && this.AddForm.value.value > 100 && this.AddForm.value.value < 1){
    //   this.toastr.warning('Giá trị không được lớn hơn 100 và nhỏ hơn 1 !');
    //   return;
    // }

    if (this.AddForm.valid) {
      var req = {
        id: this.selected_ID,
        code: this.AddForm.value?.code,
        name: this.AddForm.value?.name,
        value: this.AddForm.value?.value,
        effectiveDate: this.AddForm.value?.effectiveDate,
        expiredDate: this.AddForm.value?.expiredDate,
        status: this.AddForm.value?.status,
      }
      this.saleService.save(req).subscribe(
        (res) => {
          if (res) {
            this.toastr.success('Thành công !');
            this.handleCancel();
            this.getListSale(this.getRequest());
          }
          else {
            this.toastr.success('Thất bại !');
          }
        }
      );
    } else {
      this.AddForm.markAllAsTouched();
      Object.values(this.AddForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.isDisplay = false;
    this.isDisplaySale = false;
  }

  search() {
    this.getListSale(this.getRequest());
  }

  onSelectChange(event: any): void{
    this.saleId = event.target.value;
    this.getListDetailSaleBySaleId(this.saleId);
  }

  showAddDetailSaleModal(dataEdit: any): void {
    this.isDisplaySale = true;
    this.titleModal = 'Chương trình khuyến mại';
    this.selected_ID = 0;
    
    // if (dataEdit != null) {
    //   this.selected_ID = dataEdit.id;
    //   this.AddForm.patchValue({
    //     code: !dataEdit ? '' : dataEdit.code,
    //     name: !dataEdit ? '' : dataEdit.name,
    //     value: !dataEdit ? '' : dataEdit.value,
    //     effectiveDate: !dataEdit ? '' : dataEdit.effectiveDate,
    //     expiredDate: !dataEdit ? '' : dataEdit.expiredDate,
    //     status: !dataEdit ? 1 : dataEdit.status,
    //   });
    // }
    // else {
    //   this.AddForm.reset();
    //   this.AddForm.patchValue({
    //     status: 1,
    //     code: 'SA_' + this.makeRandomeCode(6),
    //   });
    // }
  }

}
