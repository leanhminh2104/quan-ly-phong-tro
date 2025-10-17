'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { HopDong, Phong, KhachThue } from '@/types';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ThemMoiHopDongPage() {
  const router = useRouter();
  const [phongList, setPhongList] = useState<Phong[]>([]);
  const [khachThueList, setKhachThueList] = useState<KhachThue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    maHopDong: '',
    phong: '',
    khachThueId: [] as string[],
    nguoiDaiDien: '',
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: '',
    giaThue: 0,
    tienCoc: 0,
    chuKyThanhToan: 'thang' as 'thang' | 'quy' | 'nam',
    ngayThanhToan: 15,
    dieuKhoan: `ĐIỀU KHOẢN HỢP ĐỒNG THUÊ PHÒNG

1. BÊN CHO THUÊ (Chủ nhà):
- Cung cấp phòng ở đầy đủ tiện nghi theo thỏa thuận
- Đảm bảo an ninh, an toàn cho khách thuê
- Bảo trì, sửa chữa các hư hỏng do hao mòn tự nhiên

2. BÊN THUÊ (Khách thuê):
- Thanh toán đúng hạn tiền thuê và các chi phí khác
- Sử dụng phòng đúng mục đích, giữ gìn vệ sinh
- Không được cải tạo, sửa chữa phòng mà không có sự đồng ý
- Báo cáo kịp thời các hư hỏng, sự cố

3. ĐIỀU KHOẢN CHUNG:
- Thời hạn hợp đồng: Từ ngày bắt đầu đến ngày kết thúc
- Tiền cọc: Được hoàn trả khi kết thúc hợp đồng (trừ các khoản phát sinh)
- Thanh toán: Hàng tháng vào ngày quy định
- Điện, nước: Tính theo chỉ số đồng hồ và giá quy định
- Phí dịch vụ: Theo thỏa thuận riêng

4. CHẤM DỨT HỢP ĐỒNG:
- Bên thuê có thể chấm dứt hợp đồng trước thời hạn với thông báo trước 30 ngày
- Bên cho thuê có thể chấm dứt hợp đồng nếu vi phạm nghiêm trọng
- Hoàn trả tiền cọc sau khi kiểm tra tình trạng phòng

5. ĐIỀU KHOẢN KHÁC:
- Hai bên cam kết thực hiện đúng các điều khoản đã thỏa thuận
- Mọi tranh chấp sẽ được giải quyết thông qua thương lượng
- Hợp đồng có hiệu lực kể từ ngày ký`,
    giaDien: 3500,
    giaNuoc: 25000,
    chiSoDienBanDau: 0,
    chiSoNuocBanDau: 0,
    phiDichVu: [] as Array<{ten: string, gia: number}>,
    trangThai: 'hoatDong' as 'hoatDong' | 'hetHan' | 'daHuy',
  });

  const [newPhiDichVu, setNewPhiDichVu] = useState({ ten: '', gia: 0 });
  const [openPhong, setOpenPhong] = useState(false);
  const [openKhachThue, setOpenKhachThue] = useState(false);
  const [openNguoiDaiDien, setOpenNguoiDaiDien] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch phong data
      const phongResponse = await fetch('/api/phong?limit=100');
      if (phongResponse.ok) {
        const phongData = await phongResponse.json();
        // Lọc phòng trống và đã đặt
        const availablePhong = (phongData.data || []).filter((phong: Phong) => 
          phong.trangThai === 'trong' || phong.trangThai === 'daDat'
        );
        setPhongList(availablePhong);
      }

      // Fetch khach thue data
      const khachThueResponse = await fetch('/api/khach-thue?limit=100');
      if (khachThueResponse.ok) {
        const khachThueData = await khachThueResponse.json();
        setKhachThueList(khachThueData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handlePhongChange = (phongId: string) => {
    const selectedPhong = phongList.find(p => p._id === phongId);
    if (selectedPhong) {
      setFormData(prev => ({
        ...prev,
        phong: phongId,
        giaThue: selectedPhong.giaThue,
        tienCoc: selectedPhong.tienCoc,
      }));
    }
    setOpenPhong(false);
  };

  const toggleKhachThue = (khachThueId: string) => {
    setFormData(prev => ({
      ...prev,
      khachThueId: prev.khachThueId.includes(khachThueId)
        ? prev.khachThueId.filter(id => id !== khachThueId)
        : [...prev.khachThueId, khachThueId]
    }));
  };

  const addPhiDichVu = () => {
    if (newPhiDichVu.ten && newPhiDichVu.gia > 0) {
      setFormData(prev => ({
        ...prev,
        phiDichVu: [...prev.phiDichVu, { ...newPhiDichVu }]
      }));
      setNewPhiDichVu({ ten: '', gia: 0 });
    }
  };

  const removePhiDichVu = (index: number) => {
    setFormData(prev => ({
      ...prev,
      phiDichVu: prev.phiDichVu.filter((_, i) => i !== index)
    }));
  };

  const calculateEndDate = (startDate: string, months: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    return end.toISOString().split('T')[0];
  };

  const setQuickDuration = (months: number) => {
    if (formData.ngayBatDau) {
      const endDate = calculateEndDate(formData.ngayBatDau, months);
      setFormData(prev => ({
        ...prev,
        ngayKetThuc: endDate
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/hop-dong', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ngayBatDau: new Date(formData.ngayBatDau).toISOString(),
          ngayKetThuc: new Date(formData.ngayKetThuc).toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Xóa cache để force refresh data
        sessionStorage.removeItem('hop-dong-data');
        toast.success(result.message || 'Đã tạo hợp đồng thành công');
        // Sử dụng replace để không tạo history entry mới
        // và refresh để cập nhật dữ liệu server-side
        router.replace('/dashboard/hop-dong');
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Có lỗi xảy ra khi lưu hợp đồng');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/hop-dong')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Tạo hợp đồng mới</h1>
          <p className="text-xs md:text-sm text-gray-600">Nhập thông tin hợp đồng mới</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">Thông tin hợp đồng</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Điền đầy đủ thông tin để tạo hợp đồng mới
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="maHopDong" className="text-xs md:text-sm">Mã hợp đồng</Label>
                <Input
                  id="maHopDong"
                  value={formData.maHopDong}
                  onChange={(e) => setFormData(prev => ({ ...prev, maHopDong: e.target.value.toUpperCase() }))}
                  placeholder="HD001"
                  required
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Phòng *</Label>
                <Popover open={openPhong} onOpenChange={setOpenPhong}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openPhong}
                      className="w-full justify-between text-sm"
                      size="sm"
                    >
                      {formData.phong
                        ? phongList.find((phong) => phong._id === formData.phong)?.maPhong
                        : "Chọn phòng..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] md:w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm phòng..." />
                      <CommandEmpty>Không tìm thấy phòng.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {phongList.map((phong) => (
                          <CommandItem
                            key={phong._id}
                            value={`${phong.maPhong} ${phong.dienTich} ${phong.giaThue}`}
                            onSelect={() => handlePhongChange(phong._id!)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.phong === phong._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{phong.maPhong} - {phong.dienTich}m²</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(phong.giaThue)}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-xs md:text-sm">Người đại diện</Label>
                <Popover open={openNguoiDaiDien} onOpenChange={setOpenNguoiDaiDien}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openNguoiDaiDien}
                      className="w-full justify-between text-sm"
                      size="sm"
                      disabled={formData.khachThueId.length === 0}
                    >
                      {formData.nguoiDaiDien
                        ? khachThueList.find((k) => k._id === formData.nguoiDaiDien)?.hoTen
                        : "Chọn người đại diện..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[90vw] md:w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm..." />
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {khachThueList
                          .filter(k => formData.khachThueId.includes(k._id!))
                          .map((khachThue) => (
                            <CommandItem
                              key={khachThue._id}
                              value={khachThue.hoTen}
                              onSelect={() => {
                                setFormData(prev => ({ ...prev, nguoiDaiDien: khachThue._id! }));
                                setOpenNguoiDaiDien(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.nguoiDaiDien === khachThue._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {khachThue.hoTen}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Khách thuê</Label>
              <Popover open={openKhachThue} onOpenChange={setOpenKhachThue}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openKhachThue}
                    className="w-full justify-between min-h-10 h-auto text-sm"
                    size="sm"
                  >
                    <div className="flex flex-wrap gap-1 text-xs md:text-sm">
                      {formData.khachThueId.length === 0 ? (
                        <span className="text-muted-foreground">Chọn khách thuê...</span>
                      ) : (
                        formData.khachThueId.map((id) => {
                          const khachThue = khachThueList.find(k => k._id === id);
                          return (
                            <Badge key={id} variant="secondary" className="mr-1">
                              {khachThue?.hoTen}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                  <PopoverContent className="w-[90vw] md:w-full p-0">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm khách thuê..." className="text-sm" />
                      <CommandEmpty className="text-sm">Không tìm thấy khách thuê.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                      {khachThueList.map((khachThue) => (
                        <CommandItem
                          key={khachThue._id}
                          value={khachThue.hoTen}
                          onSelect={() => toggleKhachThue(khachThue._id!)}
                        >
                          <div className="flex items-center space-x-2 w-full">
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              formData.khachThueId.includes(khachThue._id!)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-4 w-4" />
                            </div>
                            <span>{khachThue.hoTen}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {khachThue.soDienThoai}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Đã chọn {formData.khachThueId.length} khách thuê
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngayBatDau" className="text-xs md:text-sm">Ngày bắt đầu</Label>
                <Input
                  id="ngayBatDau"
                  type="date"
                  value={formData.ngayBatDau}
                  onChange={(e) => setFormData(prev => ({ ...prev, ngayBatDau: e.target.value }))}
                  required
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ngayKetThuc" className="text-xs md:text-sm">Ngày kết thúc</Label>
                <Input
                  id="ngayKetThuc"
                  type="date"
                  value={formData.ngayKetThuc}
                  onChange={(e) => setFormData(prev => ({ ...prev, ngayKetThuc: e.target.value }))}
                  required
                  className="text-sm"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDuration(3)}
                    className="text-xs"
                  >
                    3 tháng
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDuration(6)}
                    className="text-xs"
                  >
                    6 tháng
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickDuration(12)}
                    className="text-xs"
                  >
                    1 năm
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="giaThue" className="text-xs md:text-sm">Giá thuê (VNĐ/tháng)</Label>
                <Input
                  id="giaThue"
                  type="number"
                  min="0"
                  value={formData.giaThue}
                  onChange={(e) => setFormData(prev => ({ ...prev, giaThue: parseInt(e.target.value) || 0 }))}
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatCurrency(formData.giaThue)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tienCoc" className="text-xs md:text-sm">Tiền cọc (VNĐ)</Label>
                <Input
                  id="tienCoc"
                  type="number"
                  min="0"
                  value={formData.tienCoc}
                  onChange={(e) => setFormData(prev => ({ ...prev, tienCoc: parseInt(e.target.value) || 0 }))}
                  required
                  className="text-sm"
                />
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {formatCurrency(formData.tienCoc)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ngayThanhToan" className="text-xs md:text-sm">Ngày thanh toán</Label>
                <Input
                  id="ngayThanhToan"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.ngayThanhToan}
                  onChange={(e) => setFormData(prev => ({ ...prev, ngayThanhToan: parseInt(e.target.value) || 1 }))}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="chuKyThanhToan">Chu kỳ thanh toán</Label>
                <Select value={formData.chuKyThanhToan} onValueChange={(value) => setFormData(prev => ({ ...prev, chuKyThanhToan: value as 'thang' | 'quy' | 'nam' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chu kỳ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thang">Tháng</SelectItem>
                    <SelectItem value="quy">Quý</SelectItem>
                    <SelectItem value="nam">Năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="giaDien">Giá điện (VNĐ/kWh)</Label>
                <Input
                  id="giaDien"
                  type="number"
                  min="0"
                  value={formData.giaDien}
                  onChange={(e) => setFormData(prev => ({ ...prev, giaDien: parseInt(e.target.value) || 0 }))}
                  required
                />
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(formData.giaDien)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="giaNuoc">Giá nước (VNĐ/m³)</Label>
                <Input
                  id="giaNuoc"
                  type="number"
                  min="0"
                  value={formData.giaNuoc}
                  onChange={(e) => setFormData(prev => ({ ...prev, giaNuoc: parseInt(e.target.value) || 0 }))}
                  required
                />
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(formData.giaNuoc)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="trangThai">Trạng thái</Label>
                <Select value={formData.trangThai} onValueChange={(value) => setFormData(prev => ({ ...prev, trangThai: value as 'hoatDong' | 'hetHan' | 'daHuy' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoatDong">Hoạt động</SelectItem>
                    <SelectItem value="hetHan">Hết hạn</SelectItem>
                    <SelectItem value="daHuy">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chiSoDienBanDau">Chỉ số điện ban đầu (kWh)</Label>
                <Input
                  id="chiSoDienBanDau"
                  type="number"
                  min="0"
                  value={formData.chiSoDienBanDau}
                  onChange={(e) => setFormData(prev => ({ ...prev, chiSoDienBanDau: parseInt(e.target.value) || 0 }))}
                  placeholder="Nhập chỉ số điện ban đầu"
                  required
                />
                <span className="text-xs text-muted-foreground">
                  Chỉ số đồng hồ điện khi bắt đầu hợp đồng
                </span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chiSoNuocBanDau">Chỉ số nước ban đầu (m³)</Label>
                <Input
                  id="chiSoNuocBanDau"
                  type="number"
                  min="0"
                  value={formData.chiSoNuocBanDau}
                  onChange={(e) => setFormData(prev => ({ ...prev, chiSoNuocBanDau: parseInt(e.target.value) || 0 }))}
                  placeholder="Nhập chỉ số nước ban đầu"
                  required
                />
                <span className="text-xs text-muted-foreground">
                  Chỉ số đồng hồ nước khi bắt đầu hợp đồng
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dieuKhoan">Điều khoản</Label>
              <Textarea
                id="dieuKhoan"
                value={formData.dieuKhoan}
                onChange={(e) => setFormData(prev => ({ ...prev, dieuKhoan: e.target.value }))}
                rows={8}
                required
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Phí dịch vụ</Label>
              <div className="space-y-2">
                {formData.phiDichVu.map((phi, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm flex-1">{phi.ten}</span>
                    <span className="text-sm font-medium">{formatCurrency(phi.gia)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhiDichVu(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <div className="w-[50%]">
                    <Input
                      placeholder="Tên dịch vụ"
                      value={newPhiDichVu.ten}
                      onChange={(e) => setNewPhiDichVu(prev => ({ ...prev, ten: e.target.value }))}
                    />
                  </div>
                  <div className="w-[40%]">
                    <Input
                      placeholder="Giá"
                      type="number"
                      min="0"
                      value={newPhiDichVu.gia}
                      onChange={(e) => setNewPhiDichVu(prev => ({ ...prev, gia: parseInt(e.target.value) || 0 }))}
                    />
                    {newPhiDichVu.gia > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(newPhiDichVu.gia)}
                      </span>
                    )}
                  </div>
                  <div className="w-[10%]">
                    <Button type="button" onClick={addPhiDichVu} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/dashboard/hop-dong')}
                disabled={submitting}
                className="w-full sm:w-auto sm:min-w-[80px]"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                size="sm"
                disabled={submitting}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Tạo hợp đồng
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

