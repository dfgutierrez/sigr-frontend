import React from "react";
import SimpleModal from "./SimpleModal.js";

export default function TestModal({ isOpen, onClose }) {
  return (
    <SimpleModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6" style={{width: '400px'}}>
        <h2 className="text-xl font-bold mb-4">Modal de Prueba</h2>
        <p className="mb-4">Este es un modal de prueba para verificar que el posicionamiento funciona correctamente.</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </SimpleModal>
  );
}