'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCache } from '@/hooks/use-cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { DeleteConfirmPopover } from '@/components/ui/delete-confirm-popover';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CreditCard, 
  Calendar,
  Users,
  Eye,
  Filter,
  Download,
  Receipt,
  RefreshCw,
  FileText,
  Copy
} from 'lucide-react';
import { ThanhToan, HoaDon } from '@/types';
import { toast } from 'sonner';
import { ThanhToanDataTable } from './table';

// Type cho ThanhToan đã được populate
type ThanhToanPopulated = Omit<ThanhToan, 'hoaDon'> & {
  hoaDon: string | HoaDon;
};

export default function ThanhToanPage() {
  const cache = useCache<{ 
    thanhToanList: ThanhToanPopulated[];
    hoaDonList: HoaDon[];
  }>({ key: 'thanh-toan-data', duration: 300000 });
  
  const [thanhToanList, setThanhToanList] = useState<ThanhToanPopulated[]>([]);
  const [hoaDonList, setHoaDonList] = useState<HoaDon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingThanhToan, setEditingThanhToan] = useState<ThanhToanPopulated | null>(null);

  useEffect(() => {
    document.title = 'Quản lý Thanh toán';
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (!forceRefresh) {
        const cachedData = cache.getCache();
        if (cachedData) {
          setThanhToanList(cachedData.thanhToanList || []);
          setHoaDonList(cachedData.hoaDonList || []);
          setLoading(false);
          return;
        }
      }
      
      // Fetch thanh toan từ API
      const thanhToanResponse = await fetch('/api/thanh-toan');
      const thanhToanData = thanhToanResponse.ok ? await thanhToanResponse.json() : { data: [] };
      const thanhToans = thanhToanData.data || [];
      setThanhToanList(thanhToans);

      // Fetch hoa don từ API để hiển thị thông tin
      const hoaDonResponse = await fetch('/api/hoa-don');
      const hoaDonData = hoaDonResponse.ok ? await hoaDonResponse.json() : { data: [] };
      const hoaDons = hoaDonData.data || [];
      setHoaDonList(hoaDons);
      
      cache.setCache({
        thanhToanList: thanhToans,
        hoaDonList: hoaDons,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    cache.setIsRefreshing(true);
    await fetchData(true);
    cache.setIsRefreshing(false);
    toast.success('Đã tải dữ liệu mới nhất');
  };

  const testPaymentAPI = async () => {
    try {
      const response = await fetch('/api/test-payment');
      if (response.ok) {
        const data = await response.json();
        console.log('Test API response:', data);
        alert('Check console for test data');
      }
    } catch (error) {
      console.error('Test API error:', error);
    }
  };

  const filteredThanhToan = thanhToanList.filter(thanhToan => {
    const matchesSearch = thanhToan.ghiChu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         thanhToan.thongTinChuyenKhoan?.soGiaoDich?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || thanhToan.phuongThuc === methodFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && isToday(thanhToan.ngayThanhToan)) ||
                       (dateFilter === 'week' && isThisWeek(thanhToan.ngayThanhToan)) ||
                       (dateFilter === 'month' && isThisMonth(thanhToan.ngayThanhToan));
    
    return matchesSearch && matchesMethod && matchesDate;
  });

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'tienMat':
        return <Badge variant="default">Tiền mặt</Badge>;
      case 'chuyenKhoan':
        return <Badge variant="secondary">Chuyển khoản</Badge>;
      case 'viDienTu':
        return <Badge variant="outline">Ví điện tử</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const getHoaDonInfo = (hoaDon: string | any) => {
    console.log('getHoaDonInfo called with:', hoaDon, 'type:', typeof hoaDon);
    
    // Nếu hoaDon là object (đã được populate), lấy maHoaDon trực tiếp
    if (typeof hoaDon === 'object' && hoaDon?.maHoaDon) {
      console.log('Returning populated maHoaDon:', hoaDon.maHoaDon);
      return hoaDon.maHoaDon;
    }
    
    // Nếu hoaDon là string (ID), tìm trong hoaDonList
    if (typeof hoaDon === 'string') {
      const hoaDonItem = hoaDonList.find(h => h._id === hoaDon);
      console.log('Found hoaDon in list:', hoaDonItem?.maHoaDon);
      return hoaDonItem?.maHoaDon || 'Không xác định';
    }
    
    console.log('Returning default: Không xác định');
    return 'Không xác định';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= today;
  };

  const isThisMonth = (date: Date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const handleEdit = (thanhToan: ThanhToanPopulated) => {
    setEditingThanhToan(thanhToan);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/thanh-toan/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        cache.clearCache();
        setThanhToanList(prev => prev.filter(thanhToan => thanhToan._id !== id));
        toast.success('Xóa thanh toán thành công');
      } else{
        const errorData = await response.json();
        toast.error('Có lỗi xảy ra: ' + (errorData.message || 'Không thể xóa thanh toán'));
      }
    } catch (error) {
      console.error('Error deleting thanh toan:', error);
      toast.error('Có lỗi xảy ra khi xóa thanh toán');
    }
  };

  const handleDownload = (thanhToan: ThanhToanPopulated) => {
    // Implement download logic
    console.log('Downloading receipt:', thanhToan._id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="text-xs md:text-sm text-gray-600">Danh sách tất cả giao dịch thanh toán</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={cache.isRefreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${cache.isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{cache.isRefreshing ? 'Đang tải...' : 'Tải mới'}</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingThanhToan(null)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Thêm thanh toán</span>
                <span className="sm:hidden">Thêm</span>
              </Button>
            </DialogTrigger>
          <DialogContent className="w-[95vw] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingThanhToan ? 'Chỉnh sửa thanh toán' : 'Thêm thanh toán mới'}
              </DialogTitle>
              <DialogDescription>
                {editingThanhToan ? 'Cập nhật thông tin thanh toán' : 'Nhập thông tin thanh toán mới'}
              </DialogDescription>
            </DialogHeader>
            
            <ThanhToanForm 
              thanhToan={editingThanhToan}
              hoaDonList={hoaDonList}
              onClose={() => setIsDialogOpen(false)}
              onSuccess={() => {
                cache.clearCache();
                setIsDialogOpen(false);
                fetchData(true);
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4 lg:gap-6">
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Tổng giao dịch</p>
              <p className="text-base md:text-2xl font-bold">{thanhToanList.length}</p>
            </div>
            <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Tiền mặt</p>
              <p className="text-base md:text-2xl font-bold text-green-600">
                {thanhToanList.filter(t => t.phuongThuc === 'tienMat').length}
              </p>
            </div>
            <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Chuyển khoản</p>
              <p className="text-base md:text-2xl font-bold text-blue-600">
                {thanhToanList.filter(t => t.phuongThuc === 'chuyenKhoan').length}
              </p>
            </div>
            <CreditCard className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Tổng tiền</p>
              <p className="text-xs md:text-2xl font-bold text-green-600 truncate">
                {formatCurrency(thanhToanList.reduce((sum, t) => sum + t.soTien, 0))}
              </p>
            </div>
            <Receipt className="h-3 w-3 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Danh sách thanh toán</CardTitle>
          <CardDescription>
            {filteredThanhToan.length} giao dịch được tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ThanhToanDataTable
            data={filteredThanhToan}
            hoaDonList={hoaDonList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            methodFilter={methodFilter}
            onMethodChange={setMethodFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
          />
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách thanh toán</h2>
          <span className="text-sm text-gray-500">{filteredThanhToan.length} giao dịch</span>
        </div>
        
        {/* Mobile Filters */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm thanh toán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tất cả</SelectItem>
                <SelectItem value="tienMat" className="text-sm">Tiền mặt</SelectItem>
                <SelectItem value="chuyenKhoan" className="text-sm">Chuyển khoản</SelectItem>
                <SelectItem value="viDienTu" className="text-sm">Ví điện tử</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tất cả</SelectItem>
                <SelectItem value="today" className="text-sm">Hôm nay</SelectItem>
                <SelectItem value="week" className="text-sm">Tuần này</SelectItem>
                <SelectItem value="month" className="text-sm">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="space-y-3">
          {filteredThanhToan.map((thanhToan) => {
            const hoaDonInfo = typeof thanhToan.hoaDon === 'object' ? (thanhToan.hoaDon as HoaDon) : null;
            const phongInfo = hoaDonInfo && typeof hoaDonInfo.phong === 'object' ? (hoaDonInfo.phong as any) : null;
            const khachThueInfo = hoaDonInfo && typeof hoaDonInfo.khachThue === 'object' ? (hoaDonInfo.khachThue as any) : null;
            
            return (
              <Card key={thanhToan._id} className="p-4">
                <div className="space-y-3">
                  {/* Header with invoice code and method */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {hoaDonInfo?.maHoaDon || getHoaDonInfo(thanhToan.hoaDon)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(thanhToan.ngayThanhToan).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {getMethodBadge(thanhToan.phuongThuc)}
                  </div>

                  {/* Room and Tenant info */}
                  {hoaDonInfo && (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          Phòng: {phongInfo?.maPhong || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {khachThueInfo?.hoTen || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          Tháng {hoaDonInfo.thang}/{hoaDonInfo.nam}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="border-t pt-2">
                    <span className="text-gray-500 text-sm">Số tiền:</span>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(thanhToan.soTien)}</p>
                  </div>

                  {/* Transfer info if available */}
                  {thanhToan.phuongThuc === 'chuyenKhoan' && thanhToan.thongTinChuyenKhoan && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {thanhToan.thongTinChuyenKhoan.nganHang && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3" />
                          <span>{thanhToan.thongTinChuyenKhoan.nganHang}</span>
                        </div>
                      )}
                      {thanhToan.thongTinChuyenKhoan.soGiaoDich && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          <span className="font-mono">{thanhToan.thongTinChuyenKhoan.soGiaoDich}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note if available */}
                  {thanhToan.ghiChu && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      <span className="font-medium">Ghi chú: </span>
                      <span>{thanhToan.ghiChu}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(thanhToan)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(thanhToan._id!)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredThanhToan.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có giao dịch nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Form component for adding/editing thanh toan
function ThanhToanForm({ 
  thanhToan, 
  hoaDonList,
  onClose, 
  onSuccess 
}: { 
  thanhToan: ThanhToanPopulated | null;
  hoaDonList: HoaDon[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    hoaDon: thanhToan?.hoaDon ? 
      (typeof thanhToan.hoaDon === 'string' ? thanhToan.hoaDon : (thanhToan.hoaDon as HoaDon)._id || '') : '',
    soTien: thanhToan?.soTien || 0,
    phuongThuc: thanhToan?.phuongThuc || 'tienMat',
    nganHang: thanhToan?.thongTinChuyenKhoan?.nganHang || '',
    soGiaoDich: thanhToan?.thongTinChuyenKhoan?.soGiaoDich || '',
    ngayThanhToan: thanhToan?.ngayThanhToan ? new Date(thanhToan.ngayThanhToan).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    ghiChu: thanhToan?.ghiChu || '',
    anhBienLai: thanhToan?.anhBienLai || '',
  });

  // Cập nhật form data khi thanhToan thay đổi
  useEffect(() => {
    if (thanhToan) {
      setFormData({
        hoaDon: typeof thanhToan.hoaDon === 'string' ? thanhToan.hoaDon : (thanhToan.hoaDon as HoaDon)._id || '',
        soTien: thanhToan.soTien,
        phuongThuc: thanhToan.phuongThuc,
        nganHang: thanhToan.thongTinChuyenKhoan?.nganHang || '',
        soGiaoDich: thanhToan.thongTinChuyenKhoan?.soGiaoDich || '',
        ngayThanhToan: new Date(thanhToan.ngayThanhToan).toISOString().split('T')[0],
        ghiChu: thanhToan.ghiChu || '',
        anhBienLai: thanhToan.anhBienLai || '',
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        hoaDon: '',
        soTien: 0,
        phuongThuc: 'tienMat',
        nganHang: '',
        soGiaoDich: '',
        ngayThanhToan: new Date().toISOString().split('T')[0],
        ghiChu: '',
        anhBienLai: '',
      });
    }
  }, [thanhToan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const requestData = {
        hoaDonId: formData.hoaDon,
        soTien: formData.soTien,
        phuongThuc: formData.phuongThuc,
        thongTinChuyenKhoan: formData.phuongThuc === 'chuyenKhoan' ? {
          nganHang: formData.nganHang,
          soGiaoDich: formData.soGiaoDich
        } : undefined,
        ngayThanhToan: formData.ngayThanhToan,
        ghiChu: formData.ghiChu,
        anhBienLai: formData.anhBienLai
      };
      
      console.log('Submitting:', requestData);
      
      const url = thanhToan ? `/api/thanh-toan/${thanhToan._id}` : '/api/thanh-toan';
      const method = thanhToan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        onSuccess();
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('Có lỗi xảy ra: ' + (errorData.message || 'Không thể lưu dữ liệu'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra khi gửi dữ liệu');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hoaDon" className="text-xs md:text-sm">Hóa đơn</Label>
        <Select value={formData.hoaDon} onValueChange={(value) => setFormData(prev => ({ ...prev, hoaDon: value }))}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Chọn hóa đơn" />
          </SelectTrigger>
          <SelectContent>
            {hoaDonList.map((hoaDon) => (
              <SelectItem key={hoaDon._id} value={hoaDon._id!} className="text-sm">
                {hoaDon.maHoaDon} - {hoaDon.conLai.toLocaleString('vi-VN')} VNĐ còn lại
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="soTien" className="text-xs md:text-sm">Số tiền (VNĐ)</Label>
        <Input
          id="soTien"
          type="number"
          min="1"
          value={formData.soTien}
          onChange={(e) => setFormData(prev => ({ ...prev, soTien: parseInt(e.target.value) || 0 }))}
          required
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phuongThuc" className="text-xs md:text-sm">Phương thức thanh toán</Label>
        <Select value={formData.phuongThuc} onValueChange={(value) => setFormData(prev => ({ ...prev, phuongThuc: value as any }))}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Chọn phương thức" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tienMat" className="text-sm">Tiền mặt</SelectItem>
            <SelectItem value="chuyenKhoan" className="text-sm">Chuyển khoản</SelectItem>
            <SelectItem value="viDienTu" className="text-sm">Ví điện tử</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.phuongThuc === 'chuyenKhoan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="nganHang" className="text-xs md:text-sm">Ngân hàng</Label>
            <Input
              id="nganHang"
              value={formData.nganHang}
              onChange={(e) => setFormData(prev => ({ ...prev, nganHang: e.target.value }))}
              placeholder="Tên ngân hàng"
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="soGiaoDich" className="text-xs md:text-sm">Số giao dịch</Label>
            <Input
              id="soGiaoDich"
              value={formData.soGiaoDich}
              onChange={(e) => setFormData(prev => ({ ...prev, soGiaoDich: e.target.value }))}
              placeholder="Mã giao dịch"
              className="text-sm"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ngayThanhToan" className="text-xs md:text-sm">Ngày thanh toán</Label>
        <Input
          id="ngayThanhToan"
          type="date"
          value={formData.ngayThanhToan}
          onChange={(e) => setFormData(prev => ({ ...prev, ngayThanhToan: e.target.value }))}
          required
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ghiChu" className="text-xs md:text-sm">Ghi chú</Label>
        <Textarea
          id="ghiChu"
          value={formData.ghiChu}
          onChange={(e) => setFormData(prev => ({ ...prev, ghiChu: e.target.value }))}
          rows={3}
          placeholder="Ghi chú về giao dịch..."
          className="text-sm"
        />
      </div>

      <ImageUpload
        imageUrl={formData.anhBienLai}
        onImageChange={(url) => setFormData(prev => ({ ...prev, anhBienLai: url }))}
        label="Ảnh biên lai"
        placeholder="Chọn ảnh biên lai thanh toán"
      />

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
          Hủy
        </Button>
        <Button type="submit" size="sm" className="w-full sm:w-auto">
          {thanhToan ? 'Cập nhật' : 'Thêm mới'}
        </Button>
      </DialogFooter>
    </form>
  );
}
