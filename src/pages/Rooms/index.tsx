import { Layout, Button, Typography, Tag, message, Space, Input, Select, Card, Modal, Form, InputNumber, Switch, Row, Col, Upload, Divider, Checkbox, List, Carousel, Image, Popconfirm } from "antd";
import React, { useEffect, useState } from "react";
import { LogoutOutlined, PlusOutlined, SearchOutlined, EnvironmentOutlined, CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { logoutAPI } from "../../services/auth.service";
import logo from '../../assets/logo.jpg';
import './Rooms.css';

const { Header, Content } = Layout;
const { Title } = Typography; // Cố tình bỏ chữ Text để không bị Vercel báo lỗi code thừa
const { Option } = Select;
const { TextArea } = Input;

// =========================================================================
// 🚀 MOCK DATA: DỮ LIỆU GIẢ LẬP CHO BẢN DEMO (KHÔNG CẦN BACKEND)
// =========================================================================
let MOCK_DATABASE = [
    {
        id: 1,
        room_code: "ROOM-101",
        room_type: "Studio Cao Cấp",
        house_name: "Đảo Home 1 - Trung Tâm",
        is_available: true,
        rent_price: 5500000,
        address: "123 Nguyễn Cư Trinh",
        ward: "Phường Nguyễn Cư Trinh",
        district: "Quận 1",
        area_sqm: "30",
        fee_electricity: "4,000/kWh",
        fee_water: "100k/người",
        fee_parking: "Miễn phí",
        has_ac: true, has_fridge: true, has_washing_machine: true,
        has_mezzanine: false, has_balcony: true, has_bed: true,
        has_mattress: true, has_wardrobe: true, has_window: true, has_security: true,
        pet_policy: "Chỉ Mèo",
        gate_lock: "Vân tay",
        toilet: "Riêng",
        host_notes: "Sạch sẽ, an ninh 24/7, giờ giấc tự do.",
        images: [
            { id: 101, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" },
            { id: 102, image: "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        id: 2,
        room_code: "ROOM-205",
        room_type: "Phòng Có Gác",
        house_name: "Đảo Home 2 - View Sông",
        is_available: false,
        rent_price: 3800000,
        address: "456 Xô Viết Nghệ Tĩnh",
        ward: "Phường 25",
        district: "Bình Thạnh",
        area_sqm: "22",
        fee_electricity: "3,500/kWh",
        fee_water: "120k/người",
        fee_parking: "150k/xe",
        has_ac: true, has_fridge: false, has_washing_machine: false,
        has_mezzanine: true, has_balcony: false, has_bed: false,
        has_mattress: true, has_wardrobe: true, has_window: true, has_security: false,
        pet_policy: "Không",
        gate_lock: "Khóa cơ",
        toilet: "Riêng",
        host_notes: "Gần trường Hutech, tiện di chuyển",
        images: [
            { id: 201, image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    {
        id: 3,
        room_code: "ROOM-302",
        room_type: "Căn Hộ 1PN",
        house_name: "Đảo Home 3 - Thảo Điền",
        is_available: true,
        rent_price: 8000000,
        address: "789 Quốc Hương",
        ward: "Thảo Điền",
        district: "Quận 2",
        area_sqm: "45",
        fee_electricity: "Theo giá nhà nước",
        fee_water: "Theo giá nhà nước",
        fee_parking: "Miễn phí",
        has_ac: true, has_fridge: true, has_washing_machine: true,
        has_mezzanine: false, has_balcony: true, has_bed: true,
        has_mattress: true, has_wardrobe: true, has_window: true, has_security: true,
        pet_policy: "Có",
        gate_lock: "Mật khẩu",
        toilet: "Riêng",
        host_notes: "Trang bị đầy đủ nội thất cao cấp, xách vali vào ở.",
        images: [
            { id: 301, image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80" },
            { id: 302, image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=800&q=80" },
            { id: 303, image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80" }
        ]
    }
];
// =========================================================================

const Rooms: React.FC = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDistrict, setFilterDistrict] = useState<string>('all');
    const [sortPrice, setSortPrice] = useState<string>('none');

    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [form] = Form.useForm();

    // Giả lập tài khoản Admin để hiển thị nút Xóa
    let user: any = { username: 'Admin Demo', role: 'ADMIN', first_name: 'Khách' };
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Lỗi đọc thông tin user", error);
    }

    // HÀM GIẢ LẬP LẤY DỮ LIỆU TỪ MẠNG (CÓ BỘ LỌC)
    const fetchRooms = () => {
        setLoading(true);
        setTimeout(() => {
            let data = [...MOCK_DATABASE];

            if (searchText) {
                data = data.filter(r => r.room_code.toLowerCase().includes(searchText.toLowerCase()) || r.house_name.toLowerCase().includes(searchText.toLowerCase()));
            }
            if (filterStatus === 'available') data = data.filter(r => r.is_available === true);
            if (filterStatus === 'rented') data = data.filter(r => r.is_available === false);
            if (filterDistrict !== 'all') data = data.filter(r => r.district === filterDistrict);
            if (sortPrice === 'rent_price') data.sort((a, b) => a.rent_price - b.rent_price);
            if (sortPrice === '-rent_price') data.sort((a, b) => b.rent_price - a.rent_price);

            setRooms(data);
            setLoading(false);
        }, 400); // Giả lập độ trễ mạng 0.4s
    };

    useEffect(() => {
        fetchRooms();
    }, [filterStatus, filterDistrict, sortPrice, searchText]);

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // HÀM GIẢ LẬP THÊM PHÒNG VÀO BỘ NHỚ RAM
    const handleCreateRoom = (values: any) => {
        setSubmitLoading(true);
        setTimeout(() => {
            const randomId = Math.floor(Math.random() * 1000000);
            
            // Ép cứng 1 ảnh demo nếu có tạo phòng mới
            const newRoom = {
                ...values,
                id: randomId,
                room_code: `ROOM-${randomId}`,
                images: [
                    { id: randomId, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80" }
                ]
            };

            MOCK_DATABASE = [newRoom, ...MOCK_DATABASE];
            
            message.success("Thêm phòng mới thành công! (Chế độ Demo)");
            setIsModalVisible(false);
            form.resetFields();
            fetchRooms();
            setSubmitLoading(false);
        }, 800);
    };

    // HÀM GIẢ LẬP XÓA PHÒNG KHỎI BỘ NHỚ RAM
    const handleDeleteRoom = (roomId: number) => {
        MOCK_DATABASE = MOCK_DATABASE.filter(r => r.id !== roomId);
        message.success("Đã xóa phòng thành công! (Chế độ Demo)");
        fetchRooms();
    };

    const renderAmenity = (label: string, value: boolean) => (
        <Col span={12} style={{ marginBottom: 6 }}>
            <Space size={5} style={{ display: 'flex' }}>
                {value ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#f5222d" />}
                <span className="amenity-text" style={{
                    color: value ? '#2d3748' : '#a0aec0',
                    textDecoration: value ? 'none' : 'line-through'
                }}>
                    {label}
                </span>
            </Space>
        </Col>
    );

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "https://via.placeholder.com/400x300?text=Chưa+có+ảnh";
        return imagePath; 
    };

    return (
        <Layout className="rooms-layout">
            <Header className="rooms-header">
                <div className="header-logo-container">
                    <img src={logo} alt="Đảo Home Logo" className="header-logo" />
                    <Title level={4} className="header-title">Hệ Thống Quản Lý (DEMO)</Title>
                </div>
                <div>
                    <Space>
                        <span>Xin Chào, <b>{user.first_name || user.username}</b> ({user.role})</span>
                        <Button type="default" danger icon={<LogoutOutlined />} onClick={logoutAPI}>Đăng Xuất</Button>
                    </Space>
                </div>
            </Header>

            <Content className="rooms-content">
                <Card bordered={false} className="rooms-card">
                    <div className="rooms-card-header">
                        <Title level={4} className="rooms-card-title">Quản lý Phòng trọ</Title>
                        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)}>
                            Thêm dữ liệu mới
                        </Button>
                    </div>

                    <Space className="rooms-toolbar" wrap>
                        <Space wrap>
                            <Input.Search placeholder="Tìm kiếm..." allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} className="search-input" />
                            <Select defaultValue="all" className="filter-select" onChange={(value) => setFilterStatus(value)}>
                                <Option value="all">Tất cả trạng thái</Option>
                                <Option value="available">Phòng còn trống</Option>
                                <Option value="rented">Phòng đã thuê</Option>
                            </Select>
                            <Select defaultValue="all" className="filter-select" onChange={(value) => setFilterDistrict(value)} showSearch>
                                <Option value="all">Tất cả khu vực</Option>
                                <Option value="Quận 1">Quận 1</Option>
                                <Option value="Quận 2">Quận 2</Option>
                                <Option value="Quận 3">Quận 3</Option>
                                <Option value="Quận 4">Quận 4</Option>
                                <Option value="Quận 5">Quận 5</Option>
                                <Option value="Quận 7">Quận 7</Option>
                                <Option value="Quận 10">Quận 10</Option>
                                <Option value="Bình Thạnh">Bình Thạnh</Option>
                                <Option value="Tân Bình">Tân Bình</Option>
                                <Option value="Gò Vấp">Gò Vấp</Option>
                                <Option value="Phú Nhuận">Phú Nhuận</Option>
                        </Select>
                        <Select defaultValue="none" className="sort-select" onChange={(value) => setSortPrice(value)}>
                            <Option value="none">Sắp xếp mặc định</Option>
                            <Option value="rent_price">Giá: Thấp đến cao</Option>
                            <Option value="-rent_price">Giá: Cao xuống thấp</Option>
                        </Select>
                    </Space>
                    <Button onClick={fetchRooms} loading={loading}>Tải lại dữ liệu</Button>
                </Space>


                <List
                    grid={{ gutter: 24, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    dataSource={rooms}
                    loading={loading}
                    pagination={{
                        pageSize: 6,
                        position: 'bottom',
                        align: 'center',
                        showSizeChanger: true,
                        pageSizeOptions: ['6', '12', '24']
                    }}
                    renderItem={(room) => (
                        <List.Item>
                            <div className="room-item-card">

                                <div className="room-image-carousel">
                                    {room.images && room.images.length > 0 ? (
                                        <Image.PreviewGroup>
                                            <Carousel autoplay arrows dotPosition="bottom">
                                                {room.images.map((img: any) => (
                                                    <div key={img.id}>
                                                        <Image
                                                            src={getImageUrl(img.image)}
                                                            alt={`Ảnh phòng`}
                                                            className="room-image"
                                                            height={220}
                                                            width="100%"
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                ))}
                                            </Carousel>
                                        </Image.PreviewGroup>
                                    ) : (
                                        <Image
                                            src="https://via.placeholder.com/400x300?text=Chưa+có+ảnh"
                                            alt="Không có ảnh"
                                            className="room-image"
                                            height={220}
                                            width="100%"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
                                </div>

                                <div className="room-card-body">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                                {room.room_type || 'Phòng cho thuê'}
                                            </Title>
                                            <div style={{ fontWeight: 500, marginBottom: 8 }}>{room.house_name}</div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                            <Tag color={room.is_available ? 'green' : 'volcano'} style={{ margin: 0, padding: '4px 10px', fontSize: 13, borderRadius: 15 }}>
                                                {room.is_available ? 'Phòng Trống' : 'Đã Cho Thuê'}
                                            </Tag>
                                            
                                            {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                                                <Popconfirm
                                                    title="Xóa phòng trọ"
                                                    description={`Bạn có chắc chắn muốn xóa vĩnh viễn thẻ phòng này?`}
                                                    onConfirm={() => handleDeleteRoom(room.id)}
                                                    okText="Đồng ý xóa"
                                                    cancelText="Hủy"
                                                    okButtonProps={{ danger: true }}
                                                    placement="left"
                                                >
                                                    <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                                                        Xóa
                                                    </Button>
                                                </Popconfirm>
                                            )}
                                        </div>
                                    </div>

                                    <div className="room-price-title">
                                        {room.rent_price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.rent_price) : '0 ₫'} / tháng
                                    </div>

                                    <div className="room-address">
                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                        <span>
                                            {room.address ? `${room.address}, ` : ''} {room.ward ? `${room.ward}, ` : ''} {room.district}
                                        </span>
                                    </div>

                                    <Space size={15} wrap style={{ marginBottom: 15, fontSize: 13, color: '#4a5568' }}>
                                        <span>📏 <b>Diện tích:</b> {room.area_sqm ? `${room.area_sqm} m²` : 'Chưa rõ'}</span>
                                        <span>⚡ Điện: {room.fee_electricity || 'Thỏa thuận'}</span>
                                        <span>💧 Nước: {room.fee_water || 'Thỏa thuận'}</span>
                                        <span>🏍️ Xe: {room.fee_parking || 'Miễn phí'}</span>
                                    </Space>

                                    <div className="amenities-grid">
                                        <Row gutter={[8, 8]}>
                                            {renderAmenity("Máy lạnh", room.has_ac)}
                                            {renderAmenity("Tủ lạnh", room.has_fridge)}
                                            {renderAmenity("Máy giặt", room.has_washing_machine)}
                                            {renderAmenity("Gác xép", room.has_mezzanine)}
                                            {renderAmenity("Ban công", room.has_balcony)}
                                            {renderAmenity("Giường", room.has_bed)}
                                            {renderAmenity("Nệm", room.has_mattress)}
                                            {renderAmenity("Tủ quần áo", room.has_wardrobe)}
                                            {renderAmenity("Cửa sổ", room.has_window)}
                                            {renderAmenity("Bảo vệ 24/7", room.has_security)}
                                        </Row>
                                    </div>

                                    <Divider style={{ margin: '12px 0' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
                                        <Space><b>🐾 Thú cưng:</b> {room.pet_policy || 'Không'}</Space>
                                        <Space><b>🔐 Khóa cổng:</b> {room.gate_lock || 'Không rõ'}</Space>
                                        <Space><b>🚽 Toilet:</b> {room.toilet || 'Chung'}</Space>
                                        {room.host_notes && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, color: '#d97706', backgroundColor: '#fef3c7', padding: '8px', borderRadius: 6, marginTop: 5 }}>
                                                <InfoCircleOutlined style={{ marginTop: 3 }} />
                                                <span><i>{room.host_notes}</i></span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            <Modal
                title="Thêm Dữ Liệu Nhà/Phòng (Bản Demo)"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={900}
                className="scrollable-modal"
                style={{ top: 20 }}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateRoom} initialValues={{ is_available: true, toilet: 'Riêng', pet_policy: 'Không', gate_lock: 'Vân tay' }}>

                    <Divider orientation={"left" as any}>1. Thông tin cơ bản</Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="room_type" label="Dạng phòng" rules={[{ required: true, message: 'Vui lòng chọn dạng phòng!' }]}>
                                <Select placeholder="VD: Studio, Có gác...">
                                    <Option value="Studio">Studio</Option>
                                    <Option value="Phòng có gác">Phòng có gác</Option>
                                    <Option value="Duplex">Duplex</Option>
                                    <Option value="1 Phòng ngủ (1PN)">1 Phòng ngủ (1PN)</Option>
                                    <Option value="2 Phòng ngủ (2PN)">2 Phòng ngủ (2PN)</Option>
                                    <Option value="Phòng trọ thường">Phòng trọ thường</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="house_name" label="Tên nhà/Khu">
                                <Input placeholder="VD: Đảo Home 1" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="is_available" label="Trạng thái" valuePropName="checked">
                                <Switch checkedChildren="Phòng trống" unCheckedChildren="Đã thuê" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left" as any}>2. Vị trí & Chi tiết</Divider>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="district" label="Quận/Huyện">
                                <Select placeholder="Chọn Khu vực" showSearch>
                                    <Option value="Quận 1">Quận 1</Option>
                                    <Option value="Quận 2">Quận 2</Option>
                                    <Option value="Quận 3">Quận 3</Option>
                                    <Option value="Quận 4">Quận 4</Option>
                                    <Option value="Quận 5">Quận 5</Option>
                                    <Option value="Quận 7">Quận 7</Option>
                                    <Option value="Quận 10">Quận 10</Option>
                                    <Option value="Bình Thạnh">Bình Thạnh</Option>
                                    <Option value="Tân Bình">Tân Bình</Option>
                                    <Option value="Gò Vấp">Gò Vấp</Option>
                                    <Option value="Phú Nhuận">Phú Nhuận</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="area_sqm" label="Diện tích">
                                <Input placeholder="VD: 25" suffix="m2" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="toilet" label="Loại Toilet">
                                <Select>
                                    <Option value="Riêng">Riêng</Option>
                                    <Option value="Chung">Chung</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="gate_lock" label="Khóa cổng">
                                <Select>
                                    <Option value="Vân tay">Vân tay</Option>
                                    <Option value="Chìa cơ">Chìa cơ</Option>
                                    <Option value="Mật khẩu">Mật khẩu</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left" as any}>3. Giá cả & Phí dịch vụ</Divider>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="rent_price" label="Giá thuê (VNĐ)" rules={[{ required: true, message: 'Nhập giá thuê!' }]}>
                                <InputNumber className="full-width-input" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value!.replace(/\$\s?|(,*)/g, '')} placeholder="VD: 3000000" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="deposit_price" label="Tiền cọc (VNĐ)" rules={[{ required: true, message: 'Nhập tiền cọc!' }]}>
                                <InputNumber className="full-width-input" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value!.replace(/\$\s?|(,*)/g, '')} placeholder="VD: 3000000" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="fee_electricity" label="Giá điện">
                                <Input placeholder="VD: 3,500/kWh" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="fee_water" label="Giá nước">
                                <Input placeholder="VD: 100k/người" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="fee_service" label="Phí dịch vụ">
                                <Input placeholder="VD: 150k/phòng" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="fee_parking" label="Phí gửi xe">
                                <Input placeholder="VD: 100k/chiếc" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left" as any}>4. Tiện ích & Nội thất</Divider>
                    <Row gutter={16} style={{ marginBottom: 15 }}>
                        <Col span={4}><Form.Item name="has_mezzanine" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Gác xép</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_window" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Cửa sổ</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_balcony" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Ban công</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_ac" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Máy lạnh</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_fridge" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Tủ lạnh</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_washing_machine" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Máy giặt</Checkbox></Form.Item></Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={4}><Form.Item name="has_bed" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Giường</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_mattress" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Nệm</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_wardrobe" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Tủ quần áo</Checkbox></Form.Item></Col>
                        <Col span={4}><Form.Item name="has_security" valuePropName="checked" style={{ marginBottom: 0 }}><Checkbox>Bảo vệ</Checkbox></Form.Item></Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 20 }}>
                        <Col span={12}>
                            <Form.Item name="pet_policy" label="Quy định nuôi thú cưng">
                                <Select placeholder="Chọn quy định">
                                    <Option value="Không">Không cho phép</Option>
                                    <Option value="Có">Có cho phép</Option>
                                    <Option value="Mèo ghim lồng">Chỉ Mèo</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left" as any}>5. Ghi chú & Hình ảnh</Divider>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="host_notes" label="Ghi chú thêm">
                                <TextArea rows={3} placeholder="Nhập thêm ghi chú cho phòng này..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="images"
                                label="Hình ảnh phòng (1-5 ảnh)"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                            >
                                <Upload listType="picture-card" beforeUpload={() => false} maxCount={5} multiple accept="image/*">
                                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Thêm ảnh</div></div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="modal-footer-actions">
                        <Space>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={submitLoading} size="large">Lưu dữ liệu Demo</Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </Content>
        </Layout >
    );
};

export default Rooms;