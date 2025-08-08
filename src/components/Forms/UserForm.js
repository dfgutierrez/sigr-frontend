import React, { useState, useEffect } from 'react';
import { useForm, validationRules } from 'hooks/useForm';
import { VALIDATION_MESSAGES, FILE_UPLOAD } from 'constants/index';
import Button from 'components/UI/Button';
import Input from 'components/UI/Input';
import Select from 'components/UI/Select';

const UserForm = ({ 
  editingUser = null, 
  sedes = [], 
  roles = [], 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form validation rules
  const userValidationRules = {
    nombreCompleto: [validationRules.required('Nombre completo')],
    username: [validationRules.required('Usuario')],
    password: editingUser 
      ? [] // Password is optional when editing
      : [validationRules.required('Contraseña'), validationRules.minLength(6, 'Contraseña')]
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFormValues
  } = useForm({
    nombreCompleto: '',
    username: '',
    password: '',
    fotoUrl: '',
    sedeId: '',
    estado: true,
    roleIds: []
  }, userValidationRules);

  // Set form values when editing user changes
  useEffect(() => {
    if (editingUser) {
      const userRoleIds = editingUser.roleIds || editingUser.roles?.map(role => role.id) || [];
      
      setFormValues({
        nombreCompleto: editingUser.nombreCompleto || editingUser.nombre_completo || editingUser.nombre || '',
        username: editingUser.username,
        password: '',
        fotoUrl: editingUser.fotoUrl || editingUser.foto_url || '',
        sedeId: editingUser.sedeId || editingUser.sede_id || '',
        estado: editingUser.estado !== false,
        roleIds: userRoleIds
      });
    } else {
      resetForm();
    }
    
    // Clear image selection when user changes
    setSelectedImage(null);
    setImagePreview(null);
  }, [editingUser, setFormValues, resetForm]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert('Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleRoleChange = (e) => {
    const roleId = parseInt(e.target.value);
    const isChecked = e.target.checked;
    
    const newRoleIds = isChecked
      ? [...values.roleIds, roleId]
      : values.roleIds.filter(id => id !== roleId);
    
    handleChange({
      target: {
        name: 'roleIds',
        value: newRoleIds
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Additional password validation for new users
    if (!editingUser && (!values.password || values.password.length < 6)) {
      return;
    }
    
    // Additional password validation for editing users
    if (editingUser && values.password && values.password.length > 0 && values.password.length < 6) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    onSubmit(values, selectedImage);
  };

  const sedeOptions = sedes.map(sede => ({
    value: sede.id,
    label: sede.nombre,
    key: sede.id
  }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        </h3>
      </div>
      
      <div className="px-6 py-4 space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre Completo"
            name="nombreCompleto"
            value={values.nombreCompleto}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.nombreCompleto}
            required
            placeholder="Nombre completo"
          />
          
          <Input
            label="Usuario"
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.username}
            required
            placeholder="Nombre de usuario"
          />
        </div>
        
        <Input
          label={`Contraseña ${editingUser ? '(dejar vacío para mantener actual)' : ''}`}
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          required={!editingUser}
          placeholder={editingUser ? "Nueva contraseña (mínimo 6 caracteres)" : "Contraseña (mínimo 6 caracteres)"}
        />
        
        {/* Image Upload Section */}
        <div>
          <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
            Foto de Usuario
          </label>
          
          {(imagePreview || values.fotoUrl) && (
            <div className="mb-3 flex items-center space-x-3">
              <img
                src={imagePreview || values.fotoUrl}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64/e2e8f0/64748b?text=User';
                }}
              />
              <Button
                type="button"
                onClick={removeImage}
                variant="danger"
                size="small"
                icon="fas fa-times"
              >
                Quitar imagen
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="imageInput"
            />
            <label
              htmlFor="imageInput"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors inline-flex items-center shadow-md min-w-[140px] justify-center"
            >
              <i className="fas fa-camera mr-2"></i>
              {selectedImage ? 'Cambiar imagen' : 'Subir imagen'}
            </label>
            
            {selectedImage && (
              <span className="text-green-600 text-sm inline-flex items-center">
                <i className="fas fa-check-circle mr-1"></i>
                Imagen: {selectedImage.name}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            <i className="fas fa-info-circle mr-1"></i>
            Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>
        </div>
        
        <Select
          label="Sede"
          name="sedeId"
          value={values.sedeId}
          onChange={handleChange}
          onBlur={handleBlur}
          options={sedeOptions}
          placeholder="Seleccionar sede"
        />
        
        <div>
          <label className="block text-xs font-bold uppercase text-blueGray-600 mb-2">
            Roles
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-2">
            {roles.map(role => (
              <label key={role.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={values.roleIds.includes(role.id)}
                  value={role.id}
                  onChange={handleRoleChange}
                />
                <span className="text-sm text-gray-700">{role.nombre}</span>
              </label>
            ))}
          </div>
        </div>
        
        {editingUser && (
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="estado"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={values.estado}
                onChange={handleChange}
              />
              <span className="text-xs font-bold uppercase text-blueGray-600">Usuario Activo</span>
            </label>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          icon="fas fa-save"
        >
          {editingUser ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;