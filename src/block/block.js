/**
 * BLOCK: capsules
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './editor.scss';
import './style.scss';
import apiFetch from '@wordpress/api-fetch';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks

/**
 * Register: aa Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */

registerBlockType( 'cgb/block-capsules', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'capsules - CGB Block' ), // Block title.
	icon: 'shield', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'common', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'capsules — CGB Block' ),
		__( 'CGB Example' ),
		__( 'create-guten-block' ),
	],

	attributes: {
		capsules: {
			type: 'array',  // tag a
			default: [], // attribute of the tag
		},
		allcapsules: {
			type: 'array',
			default: []
		},
		totalPages: {
			type: 'number',
			default: 1,
		},
		currentPage: {
			type: 'number',
			default: 1
		},
		selectedCapsule: {
			type: ''
		},
		modalIsOpen: {
			type: 'boolean',
			default: false
		}
	},

	/**
	 * The edit function describes the structure of your block in the context of the editor.
	 * This represents what the editor will render when the block is used.
	 *
	 * The "edit" property must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Component.
	 */


	
	edit:( props ) => {
		//fetch data
		useEffect(() => {
			props.setAttributes({currentPage: props.attributes.currentPage});
			fetchData();
		}, []); 

		const itemsPerPage = 10 //limit fetch data to 10 capsules;
		
		const openModal = (capsule) => {
			//set selected capsule
			props.setAttributes({selectedCapsule: capsule});
			//open modal
			props.setAttributes({modalIsOpen: true});
		};
		
		const closeModal = () => {
			//remove selected capsule
			props.setAttributes({selectedCapsule: null});
			//close modal
			props.setAttributes({modalIsOpen: false});
		};
	
		const fetchData = () => {
			try {
				//declare offset variable
				let offset = itemsPerPage*(props.attributes.currentPage-1);

				//fetch capsules
				const response = apiFetch({
									path: `/spacex/v1/capsules?limit=${itemsPerPage}&offset=${offset}`,
									method: 'get',
								});
				response.then(resp=>{
					if (!resp) {
						throw new Error('An error has occurred while processing request');
					}
					//format date properly
					resp.map(el=>el.original_launch = formatDate(el.original_launch));

					// setCapsules( resp );
					props.setAttributes({capsules: resp});

					//backup the capsules array for filtering and sorting
					props.setAttributes({allcapsules: resp});

					//total pages
					props.setAttributes({totalPages: resp.length} );
					return resp;
				});
				return response;
			} catch (error) {
				throw error;
			}
		};

		const filterCapsules = (event) => {
			let val = event.target.value.toLowerCase();
			if(val){
				const filteredData = props.attributes.allcapsules.filter(el =>
					{
						return ((el.status.toLowerCase().includes(val))  ||
						(el.type && el.type.toLowerCase().includes(val)) ||
						(el.original_launch && el.original_launch.toLowerCase().includes(val)))
					}
				);
				props.setAttributes({capsules: filteredData});
				return;
			}
			props.setAttributes({capsules: props.attributes.allcapsules});
		};
		
		const handlePageChange = (newPage) => {
			props.setAttributes({currentPage: newPage});
			fetchData();
		};

		//format date 
		function formatDate(date) {
			const options = { year: 'numeric', month: 'long', day: 'numeric' };
			return new Date(date).toLocaleDateString(undefined, options);
		};
		
		return (
			<div className={ props.className }>
				<div>TOTAL CAPUSLES: { props.attributes.capsules.length } </div>
				<input class="search" placeholder='Filter by Status, Original Launch, Type' type="text" 
					onChange={filterCapsules}/>
				{
					props.attributes.capsules.length == 0 && (
						<div class="text-center">
							<img class="loader"
								src='https://icaengineeringacademy.com/wp-content/uploads/2019/01/ajax-loading-gif-transparent-background-2.gif'/>
						</div>
					)
				}
				
				{props.attributes.capsules.length > 0 && (
				<div>
					<div className="">
						
						<table class="styled-table">
							<thead>
								<tr>
									<th> Serial No</th>
									<th> Id</th>
									<th> Type</th>
									<th> Original Launch</th>
									<th> Missions</th>
									<th> Landings</th>
									<th> Status</th>
									<th> Action</th>
								</tr>
							</thead>
							<tbody>
								{props.attributes.capsules.map(capsule => (
									<tr key={capsule.capsule_id}>
										
										<td>{capsule.capsule_serial}</td>
										<td>{capsule.capsule_id}</td>
										<td>{capsule.type}</td>
										<td>{capsule.original_launch}</td>
										<td>{capsule.missions.length}</td>
										<td>{capsule.landings}</td>
										<td>
											<div className={`chip ${capsule.status === 'retired' ? 'inactive' : 'active'}`}>{capsule.status}</div>
										</td>
										<td>
											<button class="view-btn" onClick={() => openModal(capsule)}>View</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="pagination">
						{Array.from({ length: 10}, (_, index) => (
						<button
							key={index}	
							onClick={() => handlePageChange(index + 1)}
							className={props.attributes.currentPage === index + 1 ? 'active' : ''}
						>
							{index + 1}
						</button>
						))}
					</div>
						
						
					<Modal
						isOpen={props.attributes.modalIsOpen}
						ariaHideApp={false}
						onRequestClose={closeModal}
						contentLabel="Capsule Details"
						>
						{
						props.attributes.selectedCapsule && (<div class="modal-cont">
							<div class="modal-card">
								<div class="modal-dialog modal-sm">
									<div class="modal-content">
										<div class="modal-header">
											<h4 class="modal-title" id="staticBackdropLabel">Capsule {props.attributes.selectedCapsule.capsule_id}</h4>
											<button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={closeModal}>
												<span aria-hidden="true">&times;</span>
											</button>
										</div>
										<div class="modal-body mt-0">
											<span>{props.attributes.selectedCapsule.details}</span>

											<div class="mt-3">
												<div class="p-2 rounded checkbox-form">
													<div class="form-check">
													<label class=" newsletter form-check-label" for="flexCheckDefault-1">
														Type: {props.attributes.selectedCapsule.type}
													</label>
													</div>     
												</div>

												<div class="p-2 rounded checkbox-form">
													<div class="form-check">
													<label class=" prospect form-check-label" for="flexCheckDefault-2">
														Landings: {props.attributes.selectedCapsule.landings}
													</label>
													</div>     
												</div>

												<div class="p-2 rounded checkbox-form">
													<div class="form-check">
													<label class=" event form-check-label" for="flexCheckDefault-3">
														Reuse Count: {props.attributes.selectedCapsule.reuse_count}
													</label>
													</div>     
												</div>

												<div class="p-2 rounded checkbox-form">
													<div class="form-check">
													<label class=" customers form-check-label" for="flexCheckDefault-4">
														Date of Original Launch: {props.attributes.selectedCapsule.original_launch}
													</label>
													</div>     
												</div>

												{props.attributes.selectedCapsule.missions && props.attributes.selectedCapsule.missions.length > 0 && (<div class="p-2 rounded checkbox-form">
													<div class="form-check">
													<label class=" customers form-check-label" for="flexCheckDefault-4">
															Missions: {props.attributes.selectedCapsule.mission && props.attributes.selectedCapsule.missions.length}
														<ul>
															{
																props.attributes.selectedCapsule.missions.map(mission=>(	
																	<li class="text-white">
																		<i class="fa fa-plus"></i>
																		<span class="ml-2">{mission.name}: {mission.flight} Flights</span>
																	</li>
																))
															}
														</ul>
													</label>
													</div>     
												</div>)}

												<button type="button" onClick={closeModal}
												class="p-2 close-btn rounded checkbox-form add-list align-items-center">
													CLOSE
												</button>
											</div>
											
										</div>
									</div>
								</div>
							</div>
						</div>)}
					</Modal>
				</div>) }

			</div>
		);

	},



	/**
	 * The save function defines the way in which the different attributes should be combined
	 * into the final markup, which is then serialized by Gutenberg into post_content.
	 *
	 * The "save" property must be specified and must be a valid function.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/block-api/block-edit-save/
	 *
	 * @param {Object} props Props.
	 * @returns {Mixed} JSX Frontend HTML.
	 */
	save: ( props ) => {
		
		return (
			<div className={ props.className }>
				<div>TOTAL CAPUSLES: { props.attributes.capsules.length } </div>

				{props.attributes.capsules.length > 0 && (
				<div>
					<div className="">
						<table class="styled-table">
							<thead>
								<tr>
									<th> Serial No</th>
									<th> Id</th>
									<th> Type</th>
									<th> Original Launch</th>
									<th> Missions</th>
									<th> Landings</th>
									<th> Status</th>
								</tr>
							</thead>
							<tbody>
								{props.attributes.capsules.map(capsule => (
									<tr key={capsule.capsule_id}>
										
										<td>{capsule.capsule_serial}</td>
										<td>{capsule.capsule_id}</td>
										<td>{capsule.type}</td>
										<td>{capsule.original_launch}</td>
										<td>{capsule.missions.length}</td>
										<td>{capsule.landings}</td>
										<td>
											<div className={`chip ${capsule.status !== 'active' ? 'inactive' : 'active'}`}>{capsule.status}</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>) }

			</div>
		);

	},
} );
