import { Component, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent extends BaseComponent implements OnInit {

  AddForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
    percentPrice: new FormControl(null, [Validators.required]),
    value: new FormControl(0, [Validators.required]),
    effectiveDate: new FormControl(null, [Validators.required]),
    expiredDate: new FormControl(null, [Validators.required]),
    quantity: new FormControl(null, [Validators.required]),
    minimumAmount: new FormControl(null, [Validators.required]),
    status: new FormControl(1),
  })

  code: any;
  effectiveDate: any;
  expiredDate: any;
   
  valueType: any = [
    {id: "1", name: "Phần trăm"},
    {id: "0", name: "Giá tiền"},
  ]
  ngOnInit(): void {
    this.getListVoucher(this.getRequest());
  }

  getRequest() {
   return {
    code: this.code ?? '',
    effectiveDate: this.effectiveDate ?? null,
    expiredDate: this.expiredDate ?? null
   }
   
  }

  showConfirm(id: any): void {
    this.AddForm.get('value')?.value
    this.modal.confirm({
      nzTitle: '<i>Bạn có chắc muốn xóa voucher này không?</i>',
      // nzContent: '<b>Some descriptions</b>',
      nzOnOk: () => {
        this.voucherService.delete(id).subscribe(
          (res) => {
            if (res) {
              this.toastr.success('Xóa thành công !');
              this.getListVoucher(this.getRequest());
            }
            else {
              this.toastr.warning('Xóa thất bại !');
              this.getListVoucher(this.getRequest());
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
        percentPrice: !dataEdit ? '' : dataEdit.percentPrice,
        value: !dataEdit ? '' : dataEdit.value,
        effectiveDate: !dataEdit ? '' : dataEdit.effectiveDate,
        expiredDate: !dataEdit ? '' : dataEdit.expiredDate,
        quantity: !dataEdit ? '' : dataEdit.quantity,
        minimumAmount: !dataEdit ? '' : dataEdit.minimumAmount,
        status: !dataEdit ? 1 : dataEdit.status,
      });
    }
    else {
      this.AddForm.reset();
      this.AddForm.patchValue({
        status: 1,
        code: 'VC_' + this.makeRandomeCode(6),
      });
    }
  }

  handleOk(): void {

    var addForm = this.AddForm.value;
    const startDate = addForm?.effectiveDate;
    const endDate = addForm?.expiredDate;
    const currentDate = new Date();

    if(startDate && endDate && startDate >= endDate){
      this.toastr.warning('Ngày bắt đầu không được lơn hơn hoặc bằng ngày kết thúc !');
      return;
    }

    if(startDate && new Date(startDate).setHours(0,0,0,0) < currentDate.setHours(0,0,0,0)){
      this.toastr.warning('Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại !');
      return;
    }

    if (this.AddForm.valid) {
      var req = {
        id: this.selected_ID,
        code: addForm?.code,
        percentPrice: addForm?.percentPrice,
        value: addForm?.value,
        effectiveDate: addForm?.effectiveDate,
        expiredDate: addForm?.expiredDate,
        quantity: addForm?.quantity,
        minimumAmount: addForm?.minimumAmount,
        status: addForm?.status,
      }
      this.voucherService.save(req).subscribe(
        (res) => {
          if (res) {
            this.toastr.success('Thành công !');
            this.handleCancel();
            this.getListVoucher(this.getRequest());
          }
          else {
            this.toastr.error('Thất bại !');
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
  }

  search() {
    this.getListVoucher(this.getRequest());
  }
}
