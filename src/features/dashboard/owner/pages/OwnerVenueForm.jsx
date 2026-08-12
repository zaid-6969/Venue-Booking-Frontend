/**
 * OwnerVenueForm Component
 *
 * Comprehensive venue creation and editing form featuring:
 * - Direct Image File Upload (FileReader Base64/Blob conversion) + CDN URL support
 * - Primary Cover / Thumbnail Photo selector & preview card
 * - Multi-image Gallery Uploader with Drag-and-Drop file picker
 * - Basic Info (Name, Tagline, Category, Description)
 * - Location Details (Address, City, State, Pincode)
 * - Capacity & Pricing (Min/Max Capacity, Base Price per Day)
 * - Amenities Checklist
 * - Redux createVenue / updateVenue thunk integration
 */

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Check,
  Star,
  X,
  Sparkles,
} from 'lucide-react'

import { createVenue, updateVenue, fetchVenueById } from '@features/venues/redux/venuesThunks'
import { selectSelectedVenue, selectMutateStatus } from '@features/venues/redux/venuesSlice'
import { VENUE_CATEGORIES, AMENITIES } from '@constants/index'
import { createMultipartClient } from '@lib/apiClient'
import toast from 'react-hot-toast'

const PRESET_SAMPLE_IMAGES = [
  {
    label: 'Grand Banquet',
    url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
  },
  {
    label: 'Luxury Lawn',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
  },
  { label: 'Royal Palace', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800' },
  {
    label: 'Rooftop Sunset',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },
]

/** Upload helper: Uploads file to backend /media/upload or falls back to base64 Data URL */
const uploadImageFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append('image', file)
    const multipartClient = createMultipartClient()
    const res = await multipartClient.post('/media/upload', formData)
    if (res?.data?.url) return res.data.url
    if (res?.url) return res.url
  } catch (err) {
    console.warn('Backend image upload fallback to Data URL:', err)
  }
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

const OwnerVenueForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const coverFileInputRef = useRef(null)
  const galleryFileInputRef = useRef(null)

  const selectedVenue = useSelector(selectSelectedVenue)
  const mutateStatus = useSelector(selectMutateStatus)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagline: 'Experience luxury banquet & event space hosting',
    description:
      'Welcome to our premier event space! We provide elegant seating, ambient lighting, customizable catering options, and full air conditioning for weddings, corporate galas, and social celebrations.',
    category: 'banquet-hall',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    minCapacity: 100,
    maxCapacity: 500,
    pricePerDay: 150000,
    coverImageUrl: PRESET_SAMPLE_IMAGES[0].url,
    amenities: ['parking', 'ac', 'catering', 'decoration'],
  })

  // Gallery Images List State
  const [galleryImages, setGalleryImages] = useState([
    { url: PRESET_SAMPLE_IMAGES[0].url, fileId: 'img_1' },
    { url: PRESET_SAMPLE_IMAGES[1].url, fileId: 'img_2' },
  ])

  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchVenueById(id))
    }
  }, [isEdit, id, dispatch])

  useEffect(() => {
    if (isEdit && selectedVenue) {
      setFormData({
        name: selectedVenue.name || '',
        tagline: selectedVenue.tagline || '',
        description: selectedVenue.description || '',
        category: selectedVenue.category || 'banquet-hall',
        address: selectedVenue.location?.address || '',
        city: selectedVenue.location?.city || 'Mumbai',
        state: selectedVenue.location?.state || 'Maharashtra',
        pincode: selectedVenue.location?.pincode || '',
        minCapacity: selectedVenue.minCapacity || 100,
        maxCapacity: selectedVenue.maxCapacity || 500,
        pricePerDay: selectedVenue.pricePerDay || 150000,
        coverImageUrl: selectedVenue.coverImage?.url || PRESET_SAMPLE_IMAGES[0].url,
        amenities: selectedVenue.amenities || [],
      })

      if (selectedVenue.gallery && selectedVenue.gallery.length > 0) {
        setGalleryImages(
          selectedVenue.gallery.map((g) => ({
            url: g.url,
            fileId: g.fileId || 'img_' + Math.random(),
          }))
        )
      }
    }
  }, [isEdit, selectedVenue])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle Cover Image File Upload from Computer
  const handleCoverFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setIsUploading(true)
    const toastId = toast.loading('Uploading cover image...')
    try {
      const url = await uploadImageFile(file)
      setFormData((prev) => ({ ...prev, coverImageUrl: url }))
      toast.success('Cover image uploaded successfully!', { id: toastId })
    } catch {
      toast.error('Failed to process image file', { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Gallery Images File Upload from Computer
  const handleGalleryFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    const toastId = toast.loading(`Uploading ${files.length} gallery image(s)...`)
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        const url = await uploadImageFile(file)
        setGalleryImages((prev) => [
          ...prev,
          { url, fileId: 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) },
        ])
      }
      toast.success('Gallery image(s) uploaded successfully!', { id: toastId })
    } catch {
      toast.error('Failed to upload some gallery images', { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddGalleryUrl = (e) => {
    e.preventDefault()
    if (!newGalleryUrlInput.trim()) return
    setGalleryImages((prev) => [
      ...prev,
      { url: newGalleryUrlInput.trim(), fileId: 'url_' + Date.now() },
    ])
    setNewGalleryUrlInput('')
    toast.success('Gallery image added')
  }

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
    toast.success('Image removed from gallery')
  }

  const handleAmenityToggle = (amenityId) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenityId)
      const updated = exists
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId]
      return { ...prev, amenities: updated }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ================================
    // VALIDATION
    // ================================

    if (!formData.name || formData.name.trim().length < 3) {
      toast.error('Venue name must be at least 3 characters long.')
      return
    }

    const description = formData.description?.trim() || ''

    if (description.length < 50) {
      toast.error(
        `Description must be at least 50 characters long (currently ${description.length} chars).`
      )
      return
    }

    if (!formData.address?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
      toast.error('Please fill in complete location details (Address, City, State).')
      return
    }

    // ================================
    // GALLERY
    // ================================

    const formattedGallery = galleryImages.map((img, i) => ({
      url: img.url,
      fileId: img.fileId || `img_${i}_${Date.now()}`,
      alt: `${formData.name} Photo ${i + 1}`,
      isPrimary: i === 0,
    }))

    // ================================
    // PAYLOAD
    // ================================

    const payload = {
      name: formData.name.trim(),

      tagline: formData.tagline?.trim() || '',

      description,

      category: formData.category,

      location: {
        address: formData.address.trim(),

        city: formData.city.trim(),

        state: formData.state.trim(),

        pincode: formData.pincode?.trim() || '',
      },

      minCapacity: Number(formData.minCapacity),

      maxCapacity: Number(formData.maxCapacity),

      pricePerDay: Number(formData.pricePerDay),

      coverImage: {
        url: formData.coverImageUrl,

        fileId: 'cover_' + Date.now(),

        alt: formData.name,

        isPrimary: true,
      },

      gallery: formattedGallery,

      amenities: formData.amenities,
    }

    // ================================
    // SAVE VENUE
    // ================================

    try {
      let savedVenue

      if (isEdit) {
        savedVenue = await dispatch(
          updateVenue({
            id,
            data: payload,
          })
        ).unwrap()

        toast.success('Venue listing updated successfully!')
      } else {
        savedVenue = await dispatch(createVenue(payload)).unwrap()

        toast.success('Venue listing created successfully!')
      }

      console.log('VENUE SAVED SUCCESSFULLY:', savedVenue)

      // ==========================================
      // IMPORTANT:
      // Refresh Redux in background.
      // DO NOT await this before navigation.
      // ==========================================

      dispatch(fetchMyVenues())

      // ==========================================
      // NAVIGATE IMMEDIATELY
      // ==========================================

      navigate('/owner/venues', {
        replace: true,
      })
    } catch (err) {
      console.error('VENUE SAVE ERROR:', err)

      console.error('VENUE SAVE ERROR RESPONSE:', err?.response?.data)

      toast.error(
        err?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          'Failed to save venue listing'
      )
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        maxWidth: 880,
        margin: '0 auto',
      }}
    >
      <div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 'var(--space-2)' }}
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>
          {isEdit ? 'Edit Venue Listing' : 'Create New Venue Listing'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Provide complete details, upload photos, and set guest capacity for your venue
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}
      >
        {/* General Details */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <h3
            style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}
          >
            General Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Venue Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="e.g. The Grand Palace Banquet"
                required
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="input"
                placeholder="e.g. Where luxury meets celebration"
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {VENUE_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Provide full details about hall dimensions, lighting, ambiance, etc."
                required
                minLength={50}
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section: Thumbnail / Cover & Gallery Photos */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                Venue Cover & Gallery Images
              </h3>
              <p
                style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}
              >
                Upload high-resolution photos directly or enter image URLs to display on your venue
                listing
              </p>
            </div>
          </div>

          {/* Primary Cover / Thumbnail Upload Card */}
          <div
            style={{
              marginBottom: 'var(--space-6)',
              padding: 'var(--space-5)',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-xl)',
              border: '1px dashed var(--border-default)',
            }}
          >
            <label
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                color: 'var(--brand-default)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Primary Cover / Thumbnail Image
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                gap: 'var(--space-6)',
                alignItems: 'center',
              }}
            >
              {/* Live Cover Preview */}
              <div
                style={{
                  position: 'relative',
                  height: 140,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: '#000',
                }}
              >
                <img
                  src={formData.coverImageUrl}
                  alt="Cover Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className="badge badge-success"
                  style={{ position: 'absolute', top: 8, left: 8, fontSize: '10px' }}
                >
                  Primary Cover
                </span>
              </div>

              {/* Upload Triggers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={coverFileInputRef}
                  onChange={handleCoverFileUpload}
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 'var(--space-2)' }}
                  >
                    <UploadCloud size={16} /> Upload Cover File
                  </button>

                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      alignSelf: 'center',
                    }}
                  >
                    or paste URL below:
                  </div>
                </div>

                <input
                  type="url"
                  name="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://images.unsplash.com/..."
                  required
                />

                {/* Preset sample images */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    flexWrap: 'wrap',
                    marginTop: 2,
                  }}
                >
                  <span
                    style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}
                  >
                    Preset Samples:
                  </span>
                  {PRESET_SAMPLE_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, coverImageUrl: sample.url }))
                      }
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '11px', padding: '2px 8px', height: 'auto' }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Photo Gallery Upload Section */}
          <div
            style={{
              padding: 'var(--space-5)',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Gallery Photos ({galleryImages.length})
                </label>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Add internal hall photos, dining setups, stage designs, and parking areas
                </p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                ref={galleryFileInputRef}
                onChange={handleGalleryFileUpload}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ gap: 'var(--space-2)' }}
              >
                <UploadCloud size={16} /> Upload Multiple Photos
              </button>
            </div>

            {/* Gallery Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    height: 100,
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    background: '#000',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <img
                    src={img.url}
                    alt={`Gallery ${i}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(i)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.7)',
                      border: 'none',
                      color: '#ef4444',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="Remove Photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Gallery Image via URL */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                type="url"
                value={newGalleryUrlInput}
                onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                className="input"
                placeholder="Or paste gallery image URL (https://...)"
                style={{ fontSize: 'var(--text-xs)' }}
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="btn btn-secondary btn-sm"
                style={{ flexShrink: 0 }}
              >
                Add URL Photo
              </button>
            </div>
          </div>
        </div>

        {/* Location & Pricing */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <h3
            style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}
          >
            Location & Pricing
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Min Guest Capacity
              </label>
              <input
                type="number"
                name="minCapacity"
                value={formData.minCapacity}
                onChange={handleChange}
                className="input"
                required
                min={10}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Max Guest Capacity
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                className="input"
                required
                min={10}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--text-tertiary)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Price per Day (₹)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                className="input"
                required
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Amenities Checklist */}
        <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-1)' }}>
          <h3
            style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}
          >
            Amenities Offered
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {AMENITIES.map((am) => (
              <label
                key={am.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(am.id)}
                  onChange={() => handleAmenityToggle(am.id)}
                  style={{ accentColor: 'var(--brand-default)', width: 16, height: 16 }}
                />
                <span>{am.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutateStatus === 'loading'}
          className="btn btn-primary btn-lg"
          style={{ alignSelf: 'flex-start', gap: 'var(--space-2)', fontWeight: 700 }}
        >
          <Save size={18} />{' '}
          {mutateStatus === 'loading'
            ? 'Saving Listing...'
            : isEdit
              ? 'Update Listing'
              : 'Submit Venue Listing'}
        </button>
      </form>
    </div>
  )
}

export default OwnerVenueForm
